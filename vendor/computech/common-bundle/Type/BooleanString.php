<?php
namespace Computech\Bundle\CommonBundle\Type;

use Doctrine\DBAL\Types\Type;
use Doctrine\DBAL\Platforms\AbstractPlatform;

/**
 * BooleanString
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/computech/CommonBundle
 */
class BooleanString extends Type
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
     * @return null
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
        return 'booleanstring';
    }

    /**
     * @param boolean          $value
     * @param AbstractPlatform $platform
     *
     * @return string
     */
    public function convertToDatabaseValue($value, AbstractPlatform $platform)
    {
        return $value ? '1' : '0';
    }

    /**
     * @param string           $value
     * @param AbstractPlatform $platform
     *
     * @return boolean
     */
    public function convertToPHPValue($value, AbstractPlatform $platform)
    {
        switch ($value) {
            case '1':
            case 'Yes':
            case 'On':
                return true;

            default:
                return false;
        }
    }
}
