<?php
/**
 * Timestamp
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/FileMakerBundle.git
 */
namespace Synergize\Bundle\DbalBundle\Type;

use Doctrine\DBAL\Types\Type,
    Doctrine\DBAL\Platforms\AbstractPlatform;

/**
 * Timestamp
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/FileMakerBundle.git
 */
class TimestampType extends Type
{
    public function getName()
    {
        return 'timestamp';
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
            return 'timestamp;value=' . $value->format('Y-m-d H:i:s');
        } else {
            return $value;
        }
    }

    public function convertToPHPValue($value, AbstractPlatform $platform)
    {
        if (empty($value)) {
            return null;
        } else {
            $timestamp = \DateTime::createFromFormat('Y-m-d H:i:s', $value);

            if ($timestamp === false) {
                $timestamp = \DateTime::createFromFormat('Y-m-d', $value);

                if ($timestamp === false) {
                    return null;
                }
            }

            return $timestamp;
        }
    }
}
