<?php
/**
 * Time
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/FileMakerBundle.git
 */
namespace Synergize\Bundle\DbalBundle\Type;

use Doctrine\DBAL\Types\Type,
    Doctrine\DBAL\Platforms\AbstractPlatform;

/**
 * Time
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/FileMakerBundle.git
 */
class TimeType extends Type
{
    public function getName()
    {
        return 'time';
    }

    public function getSQLDeclaration(array $field, AbstractPlatform $platform)
    {
        return null;
    }

    public function convertToDatabaseValue($value, AbstractPlatform $platform)
    {
        if (is_null($value)) {
            return '';
        } else if ($value instanceof \DateTime) {
            return 'time;value=' . $value->format('H:i:s');
        } else {
            return $value;
        }
    }

    public function convertToPHPValue($value, AbstractPlatform $platform)
    {
        if (empty($value)) {
            return null;
        } else {
            return \DateTime::createFromFormat('H:i:s', $value);
        }
    }
}
