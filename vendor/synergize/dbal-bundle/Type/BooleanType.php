<?php
namespace Synergize\Bundle\DbalBundle\Type;

use Doctrine\DBAL\Types\Type,
    Doctrine\DBAL\Platforms\AbstractPlatform;

/**
 * Boolean
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/FileMakerBundle.git
 */
class BooleanType extends Type
{
    public function getName()
    {
        return 'boolean';
    }

    public function getSQLDeclaration(array $field, AbstractPlatform $platform)
    {
        return null;
    }

    public function convertToDatabaseValue($value, AbstractPlatform $platform)
    {
        if (is_null($value)) {
            return '';
        } else {
            return 'number;value=' . ($value ? 1 : 0);
        }
    }

    public function convertToPHPValue($value, AbstractPlatform $platform)
    {
        return $value === 1;
    }
}
