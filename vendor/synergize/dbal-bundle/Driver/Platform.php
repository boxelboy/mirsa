<?php
namespace Synergize\Bundle\DbalBundle\Driver;

use Doctrine\DBAL\Platforms\AbstractPlatform;

class Platform extends AbstractPlatform
{
    public function getBooleanTypeDeclarationSQL(array $columnDef)
    {
        return 'NUMERIC';
    }

    public function getIntegerTypeDeclarationSQL(array $columnDef)
    {
        return 'NUMERIC';
    }

    public function getBigIntTypeDeclarationSQL(array $columnDef)
    {
        return 'NUMERIC';
    }

    public function getSmallIntTypeDeclarationSQL(array $columnDef)
    {
        return 'NUMERIC';
    }

    protected function _getCommonIntegerTypeDeclarationSQL(array $columnDef)
    {
        return '';
    }

    public function getCountExpression($column)
    {
        return 'COUNT(*)';
    }

    protected function initializeDoctrineTypeMappings()
    {
        $this->doctrineTypeMapping = array(
            'numeric'       => 'integer',
            'decimal'       => 'float',
            'int'           => 'integer',
            'date'          => 'datetime',
            'time'          => 'datetime',
            'timestamp'     => 'datetime',
            'varchar'       => 'text',
            'blob'          => 'text',
            'varbinary'     => 'text',
            'longvarbinary' => 'text'
        );
    }

    public function getClobTypeDeclarationSQL(array $field)
    {
        throw new SynergizeException(__METHOD__);
    }

    public function getBlobTypeDeclarationSQL(array $field)
    {
        throw new SynergizeException(__METHOD__);
    }

    public function getName()
    {
        return 'synergize';
    }

    protected function doModifyLimitQuery($query, $limit, $offset)
    {
        if ($offset !== null) {
            $query .= ' OFFSET ' . $offset . ' ROWS';
        }

        if ($limit !== null) {
            $query .= ' FETCH FIRST ' . $limit . ' ROWS ONLY';
        }

        return $query;
    }

    public function getSqlCommentStartString()
    {
        return "/*";
    }

    public function getSqlCommentEndString()
    {
        return "*/";
    }

    public function getMd5Expression($column)
    {
        throw \Doctrine\DBAL\DBALException::notSupported(__METHOD__);
    }

    public function getNowExpression()
    {
        return 'DATE()';
    }

    public function getNotExpression($expression)
    {
        return 'NOT ' . $expression;
    }

    public function getAcosExpression($value)
    {
        throw \Doctrine\DBAL\DBALException::notSupported(__METHOD__);
    }

    public function getCosExpression($value)
    {
        throw \Doctrine\DBAL\DBALException::notSupported(__METHOD__);
    }

    public function getDateAddDaysExpression($date, $days)
    {
        return $date . ' + ' . $days;
    }

    public function getDateSubDaysExpression($date, $days)
    {
        return $date . ' - ' . $days;
    }

    public function supportsIndexes()
    {
        return false;
    }

    public function supportsAlterTable()
    {
        return true;
    }

    public function supportsTransactions()
    {
        return false;
    }

    public function supportsSavepoints()
    {
        return false;
    }

    public function supportsPrimaryConstraints()
    {
        return false;
    }

    public function supportsForeignKeyConstraints()
    {
        return false;
    }

    public function supportsSchemas()
    {
        return false;
    }

    public function canEmulateSchemas()
    {
        return false;
    }

    public function supportsCreateDropDatabase()
    {
        return false;
    }

    public function supportsGettingAffectedRows()
    {
        return false;
    }

    public function supportsInlineColumnComments()
    {
        return false;
    }

    public function supportsCommentOnStatement()
    {
        return false;
    }

    public function getSQLResultCasing($column)
    {
        return 'c' . parent::getSQLResultCasing($column);
    }
}
