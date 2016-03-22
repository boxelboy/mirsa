<?php
namespace Computech\Bundle\CommonBundle\Type;

use Doctrine\DBAL\Types\Type;
use Doctrine\DBAL\Platforms\AbstractPlatform;
use Doctrine\Common\Collections\ArrayCollection;

/**
 * Notes Doctrine type
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/computech/CommonBundle
 */
class Notes extends Type
{
    /**
     * @return boolean
     */
    public function canRequireSQLConversion()
    {
        return false;
    }

    /**
     * @param array            $fieldDeclaration
     * @param AbstractPlatform $platform
     *
     * @return null|string
     */
    public function getSQLDeclaration(array $fieldDeclaration, AbstractPlatform $platform)
    {
        return null;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'notes';
    }

    /**
     * @param ArrayCollection  $value
     * @param AbstractPlatform $platform
     *
     * @return string
     */
    public function convertToDatabaseValue($value, AbstractPlatform $platform)
    {
        $notesString = '';

        if (is_array($value)) {
            foreach (array_reverse($value) as $entry) {
                $notesString .= sprintf(
                    "********************  Added by: %s at: %s *************************\r%s\r\r",
                    $entry->getAuthor(),
                    $entry->getCreated()->format('d/m/Y H:i:s'),
                    $entry->getNotes()
                );
            }
        }

        return $notesString;
    }

    /**
     * @param ArrayCollection|NotesEntry $value
     * @param AbstractPlatform           $platform
     *
     * @return ArrayCollection|NotesEntry
     */
    public function convertToPHPValue($value, AbstractPlatform $platform)
    {
        $entries = array();

        try {
            $splitNotes = preg_split("/[\r\n]{2}/", $value);

            while ($authorNote = array_shift($splitNotes)) {
                $search = array();
                $split = explode('*************************', $authorNote);

                preg_match(
                    '/Added by: (.*?) at: ([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4} [0-9]{1,2}:[0-9]{1,2})/',
                    $split[0],
                    $search
                );

                if (count($search) != 3) {
                    throw new \Exception('Badly formatted notes');
                }

                $split = preg_split("/[\r\n]/", $authorNote);

                if (count($split) < 2) {
                    $notes = array_shift($splitNotes);
                } else {
                    $notes = $split[1];
                }

                $entry = new NotesEntry($search[1], $notes);
                $entry->setCreated(\DateTime::createFromFormat('d/m/Y H:i', $search[2]));

                $entries[] = $entry;
            }
        } catch (\Exception $e) {
            $entry = new NotesEntry('Recovered notes', $value);
            $entry->setCreated(new \DateTime());

            $entries[] = $entry;
        }

        return array_reverse($entries);
    }
}
