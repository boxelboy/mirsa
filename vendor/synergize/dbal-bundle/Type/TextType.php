<?php
namespace Synergize\Bundle\DbalBundle\Type;

use Doctrine\DBAL\Types\Type,
    Doctrine\DBAL\Platforms\AbstractPlatform;

/**
 * Text
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/FileMakerBundle.git
 */
class TextType extends Type
{
    public function getName()
    {
        return 'text';
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
            return $value;
        }
    }

    public function convertToPHPValue($value, AbstractPlatform $platform)
    {
        if (empty($value)) {
            return null;
        } else {
            return $value;
        }
    }
}
