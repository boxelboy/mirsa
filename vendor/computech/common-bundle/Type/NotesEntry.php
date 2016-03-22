<?php
namespace Computech\Bundle\CommonBundle\Type;

/**
 * NotesEntry
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/computech/CommonBundle
 */
class NotesEntry
{
    /**
     * @var string
     */
    protected $author;

    /**
     * @var \DateTime
     */
    protected $created;

    /**
     * @var string
     */
    protected $notes;

    function __construct($author, $notes)
    {
        $this->author = $author;
        $this->notes = $notes;
        $this->created = new \DateTime();
    }

    /**
     * @return string
     */
    public function getAuthor()
    {
        return $this->author;
    }

    /**
     * @param string $author
     */
    public function setAuthor($author)
    {
        $this->author = $author;
    }

    /**
     * @return \DateTime
     */
    public function getCreated()
    {
        return $this->created;
    }

    /**
     * @param \DateTime $created
     */
    public function setCreated(\DateTime $created)
    {
        $this->created = $created;
    }

    /**
     * @return string
     */
    public function getNotes()
    {
        return $this->notes;
    }

    /**
     * @param string $notes
     */
    public function setNotes($notes)
    {
        $this->notes = $notes;
    }
}
