<?php
/**
 * Container
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/FileMakerBundle.git
 */
namespace Synergize\Bundle\DbalBundle\Type;

use Doctrine\DBAL\Types\Type;
use Doctrine\DBAL\Platforms\AbstractPlatform;

/**
 * Container Doctrine type
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/CommonBundle.git
 */
class ContainerType extends Type
{
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
        return 'container';
    }

    /**
     * @param ContainerField   $value
     * @param AbstractPlatform $platform
     *
     * @return string
     */
    public function convertToDatabaseValue($value, AbstractPlatform $platform)
    {
        if (empty($value) || !$value->isUploadedFile()) {
            return '';
        } else {
            return '@' . $value->getUploadedFile()->getPathname() . ';filename=' . $value->getUploadedFile()->getClientOriginalName();
        }
    }

    /**
     * @param string           $value
     * @param AbstractPlatform $platform
     *
     * @return ContainerField|null
     */
    public function convertToPHPValue($value, AbstractPlatform $platform)
    {
        return new ContainerField($value);
    }
}
