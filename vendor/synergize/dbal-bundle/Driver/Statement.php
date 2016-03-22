<?php
namespace Synergize\Bundle\DbalBundle\Driver;

use Doctrine\DBAL\Driver\Statement as StatementInterface;

class Statement implements \IteratorAggregate, StatementInterface
{
    /**
     * @var Connection
     */
    private $_connection;

    /**
     * @var array
     */
    private $_boundValues;

    /**
     * @var string
     */
    private $_query;

    /**
     * @var array
     */
    private $_result;

    /**
     * @var integer
     */
    private $_fetchMode = \PDO::FETCH_BOTH;

    /**
     * @var integer
     */
    private $_cursor = 0;

    /**
     * @var array
     */
    private $_columnNames = array();

    /**
     * @param Connection $connection
     * @param string     $prepareString
     */
    public function __construct(Connection $connection, $prepareString)
    {
        $this->_connection = $connection;
        $this->_query = $prepareString;
        $this->_boundValues = array();

        $parser = new \PHPSQLParser($prepareString);

        if (isset($parser->parsed['SELECT'])) {
            foreach ($parser->parsed['SELECT'] as $column) {
                if ($column['alias']) {
                    $this->_columnNames[] = $column['alias']['no_quotes'];
                }
            }
        }
        
        foreach ($parser->parsed as &$section) {
            foreach ($section as &$part) {
                if (isset($part['expr_type']) && $part['expr_type'] == 'colref') {
                    $columnReference = explode('.', $part['base_expr']);
                    
                    if (count($columnReference) == 2 && $columnReference[1][0] == '_') {
                        $columnReference[1] = '"' . $columnReference[1] . '"';
                        
                        $part['base_expr'] = implode('.', $columnReference);
                        $part['no_quotes'] = implode('.', $columnReference);
                    }
                }
            }
        }
        
        if (isset($parser->parsed['FETCH'])) {
            $fetchPart = $parser->parsed['FETCH'];
            
            unset($parser->parsed['FETCH']);
        }
        
        if (isset($parser->parsed['OFFSET'])) {
            $offsetPart = $parser->parsed['OFFSET'];
            
            unset($parser->parsed['OFFSET']);
        }
        
        $creator = new \PHPSQLCreator();
        
        $creator->create($parser->parsed);
        
        $this->_query = $creator->created;
        
        if (isset($offsetPart)) {
            $this->_query .= ' OFFSET' . implode('', $offsetPart);
        }
        
        if (isset($fetchPart)) {
            $this->_query .= ' FETCH' . implode('', $fetchPart);
        }
    }

    /**
     * {@inheritdoc}
     */
    public function bindValue($param, $value, $type = null)
    {
        $this->_boundValues[$param] = $value;
    }

    /**
     * {@inheritdoc}
     */
    public function bindParam($param, &$variable, $type = null, $length = null)
    {
        $this->_boundValues[$param] =& $variable;
    }

    /**
     * {@inheritdoc}
     */
    public function errorCode()
    {
        return $this->_connection->errorCode();
    }

    /**
     * {@inheritdoc}
     */
    public function errorInfo()
    {
        return $this->_connection->errorInfo();
    }

    public function escape($parameter)
    {
        $result = $parameter;

        switch (true) {
            case is_string($result):
                $result = $this->_connection->quote($result);
                break;

            case is_null($result):
                $result = 'NULL';
                break;

            case is_array($result):
                foreach ($result as &$value) {
                    $value = $this->escape($value);
                }

                $result = implode(', ', $result);
                break;

            case is_object($result):
                $result = addslashes((string) $result);
                break;
        }

        return $result;
    }

    /**
     * {@inheritdoc}
     */
    public function execute($params = null)
    {
        $curl = $this->_connection->getCurlHandle();

        if (is_array($params)) {
            foreach ($params as $index => $param) {
                $this->bindValue($index + 1, $param);
            }
        }

        $data = array(
            'action' => 'sql',
            'query' => $this->_query
        );

        foreach ($this->_boundValues as $index => $value) {
            $data['params[' . $index . ']'] = $value;
        }

        if ($this->_connection->getFilename()) {
            $data['file'] = $this->_connection->getFilename();
        }

        curl_setopt($curl, CURLOPT_POSTFIELDS, $data);

        $response = preg_replace('/[^\x20-\x7E]/','', curl_exec($curl));

        if ($response === false) {
            $this->_connection->setErrorCode(curl_errno($curl));
            $this->_connection->setErrorInfo(curl_error($curl));

            throw new SynergizeException($this->_connection->errorInfo(), $this->_connection->errorCode());
        }

        $this->_result = json_decode($response, true);

        if ($this->_result['status'] !== 0) {
            $this->_connection->setErrorCode($this->_result['status']);
            $this->_connection->setErrorInfo($this->_result['results']);

            throw new SynergizeException($this->_connection->errorInfo(), $this->_connection->errorCode());
        }

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function rowCount()
    {
        if ($this->_result === null) {
            throw new SynergizeException('Statement not executed');
        }

        return count($this->_result['results']);
    }

    /**
     * {@inheritdoc}
     */
    public function closeCursor()
    {
        $this->_result = null;
        $this->_cursor = 0;

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function columnCount()
    {
        if ($this->_result === null) {
            throw new SynergizeException('Statement not executed');
        }

        if (!is_array($this->_result['results']) || !count($this->_result['results'])) {
            throw new SynergizeException('Empty result set');
        }

        return count($this->_result['results'][0]);
    }

    /**
     * {@inheritdoc}
     */
    public function setFetchMode($fetchMode, $arg2 = null, $arg3 = null)
    {
        $this->_fetchMode = $fetchMode;

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function fetch($fetchMode = null)
    {
        if ($this->_result['status'] !== 0) {
            throw new SynergizeException($this->_connection->errorInfo(), $this->_connection->errorCode());
        }

        if ($this->_cursor >= $this->rowCount()) {
            return null;
        }

        $fetchMode = $fetchMode ?: $this->_fetchMode;
        $values = $this->_result['results'][$this->_cursor++];

        switch ($fetchMode) {
            case \PDO::FETCH_NUM:
                return $values;

            case \PDO::FETCH_ASSOC:
                return array_combine($this->_columnNames, $values);

            case \PDO::FETCH_BOTH:
                $ret = array_combine($this->_columnNames, $values);
                $ret += $values;
                return $ret;

            default:
                throw new SynergizeException("Unknown fetch type '{$fetchMode}'");
        }
    }

    /**
     * {@inheritdoc}
     */
    public function fetchAll($fetchMode = null)
    {
        $fetchMode = $fetchMode ?: $this->_fetchMode;

        $rows = array();

        if ($fetchMode === \PDO::FETCH_COLUMN) {
            while (($row = $this->fetchColumn()) !== false) {
                $rows[] = $row;
            }
        } else {
            while (($row = $this->fetch($fetchMode)) !== null) {
                $rows[] = $row;
            }
        }

        return $rows;
    }

    /**
     * {@inheritdoc}
     */
    public function fetchColumn($columnIndex = 0)
    {
        $row = $this->fetch(\PDO::FETCH_NUM);

        if ($row === null) {
            return false;
        }

        return $row[$columnIndex];
    }

    /**
     * {@inheritdoc}
     */
    public function getIterator()
    {
        $data = $this->fetchAll();

        return new \ArrayIterator($data);
    }
}
