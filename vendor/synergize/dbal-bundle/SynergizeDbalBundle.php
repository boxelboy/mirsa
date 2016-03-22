<?php
namespace Synergize\Bundle\DbalBundle;

use Symfony\Component\HttpKernel\Bundle\Bundle;
use Doctrine\DBAL\Types\Type;

class SynergizeDbalBundle extends Bundle
{
    public function boot()
    {
        require_once 'SqlParser/PHPSQLParser.php';
        require_once 'SqlParser/PHPSQLCreator.php';

        $this->registerDoctrineType('bigint', 'Synergize\Bundle\DbalBundle\Type\NumberType');
        $this->registerDoctrineType('binary', 'Synergize\Bundle\DbalBundle\Type\ContainerType');
        $this->registerDoctrineType('blob', 'Synergize\Bundle\DbalBundle\Type\ContainerType');
        $this->registerDoctrineType('boolean', 'Synergize\Bundle\DbalBundle\Type\BooleanType');
        $this->registerDoctrineType('container', 'Synergize\Bundle\DbalBundle\Type\ContainerType');
        $this->registerDoctrineType('date', 'Synergize\Bundle\DbalBundle\Type\DateType');
        $this->registerDoctrineType('datetime', 'Synergize\Bundle\DbalBundle\Type\TimestampType');
        $this->registerDoctrineType('decimal', 'Synergize\Bundle\DbalBundle\Type\NumberType');
        $this->registerDoctrineType('float', 'Synergize\Bundle\DbalBundle\Type\NumberType');
        $this->registerDoctrineType('integer', 'Synergize\Bundle\DbalBundle\Type\NumberType');
        $this->registerDoctrineType('number', 'Synergize\Bundle\DbalBundle\Type\NumberType');
        $this->registerDoctrineType('string', 'Synergize\Bundle\DbalBundle\Type\TextType');
        $this->registerDoctrineType('text', 'Synergize\Bundle\DbalBundle\Type\TextType');
        $this->registerDoctrineType('time', 'Synergize\Bundle\DbalBundle\Type\TimeType');
        $this->registerDoctrineType('timestamp', 'Synergize\Bundle\DbalBundle\Type\TimestampType');
    }

    private function registerDoctrineType($type, $class)
    {
        if (Type::hasType($type)) {
            Type::overrideType($type, $class);
        } else {
            Type::addType($type, $class);
        }
    }
}
