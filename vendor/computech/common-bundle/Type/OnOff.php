<?php
namespace Computech\Bundle\CommonBundle\Type;

use Doctrine\DBAL\Types\Type;
use Doctrine\DBAL\Platforms\AbstractPlatform;

/**
 * OnOff Doctrine type
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/computech/CommonBundle
 */
class OnOff extends Type
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
        return 'onoff';
    }

    /**
     * @param boolean          $value
     * @param AbstractPlatform $platform
     *
     * @return string
     */
    public function convertToDatabaseValue($value, AbstractPlatform $platform)
    {
        if ($value === 'false') {
            return 'Off';
        }

        return $value ? 'On' : 'Off';
    }

    /**
     * @param string           $value
     * @param AbstractPlatform $platform
     *
     * @return boolean
     */
    public function convertToPHPValue($value, AbstractPlatform $platform)
    {
        return $value == 'On' ? true : false;
    }
}
