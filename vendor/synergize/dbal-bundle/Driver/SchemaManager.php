<?php
namespace Synergize\Bundle\DbalBundle\Driver;

use Doctrine\DBAL\Schema\AbstractSchemaManager;
use Doctrine\DBAL\Schema\Column;

class SchemaManager extends AbstractSchemaManager
{
    public function _getPortableTableColumnDefinition($tableColumn)
    {
        $tableColumn = array_change_key_case($tableColumn);
        $type = $this->_platform->getDoctrineTypeMapping($tableColumn['type1']);

        return new Column($tableColumn['field0'], \Doctrine\DBAL\Types\Type::getType($type), array());
    }
}
