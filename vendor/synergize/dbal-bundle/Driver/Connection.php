<?php
namespace Synergize\Bundle\DbalBundle\Driver;

use Doctrine\DBAL\DBALException;
use Doctrine\DBAL\Driver\Connection as ConnectionInterface;

class Connection implements ConnectionInterface
{
    /**
     * @var resource
     */
    private $_curl;

    /**
     * @var int
     */
    private $_lastErrorCode;

    /**
     * @var string
     */
    private $_lastErrorMessage;

    /**
     * @var string
     */
    private $_filename;

    /**
     * @param array  $params
     * @param string $username
     * @param string $password
     * @param array  $driverOptions
     *
     * @throws DBALException
     */
    public function __construct(array $params, $username, $password, array $driverOptions = array())
    {
        $this->_curl = curl_init();

        $protocol = isset($params['protocol']) && $params['protocol'] ? $params['protocol'] : 'http';
        $host = isset($params['host']) && $params['host'] ? $params['host'] : '127.0.0.1';
        $port = isset($params['port']) && $params['port'] ? $params['port'] : $_SERVER['SERVER_PORT'];

        if (isset($params['dbname'])) {
            $this->_filename = $params['dbname'];
        }

        if (!in_array($protocol, array('http', 'https'))) {
            throw new DBALException(sprintf('Invalid protocol (%s)', $protocol));
        }

        curl_setopt($this->_curl, CURLOPT_URL, sprintf('%s://%s:%s/fm', $protocol, $host, $port));
        curl_setopt($this->_curl, CURLOPT_USERPWD, $username . ':' . $password);
        curl_setopt($this->_curl, CURLOPT_ENCODING , 'gzip');
        curl_setopt($this->_curl, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($this->_curl, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($this->_curl, CURLOPT_RETURNTRANSFER, true);
    }

    public function __destruct()
    {
        curl_close($this->_curl);
    }

    /**
     * {@inheritdoc}
     */
    public function prepare($prepareString)
    {
        return new Statement($this, $prepareString);
    }

    /**
     * {@inheritDoc}
     */
    public function beginTransaction()
    {
        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function query()
    {
        $args = func_get_args();
        $sql = $args[0];

        $statement = $this->prepare($sql);
        $statement->execute();

        return $statement;
    }

    /**
     * {@inheritdoc}
     */
    public function quote($input, $type = \PDO::PARAM_STR)
    {
        return "'" . str_replace('\'', '\'\'', $input) . "'";
    }

    /**
     * {@inheritdoc}
     */
    public function exec($query)
    {
        $statement = $this->prepare($query);
        $statement->execute();

        return $statement->rowCount();
    }

    /**
     * {@inheritdoc}
     */
    public function lastInsertId($name = null)
    {
        return null;
    }

    /**
     * {@inheritdoc}
     */
    public function commit()
    {
        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function rollBack()
    {
        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function errorCode()
    {
        return $this->_lastErrorCode;
    }

    /**
     * {@inheritdoc}
     */
    public function errorInfo()
    {
        return $this->_lastErrorMessage;
    }

    /**
     * @param int $errorCode
     */
    public function setErrorCode($errorCode)
    {
        $this->_lastErrorCode = $errorCode;
    }

    /**
     * @param string $errorInfo
     */
    public function setErrorInfo($errorInfo)
    {
        $this->_lastErrorMessage = $errorInfo;
    }

    /**
     * @return resource
     */
    public function getCurlHandle()
    {
        return $this->_curl;
    }

    /**
     * @return string
     */
    public function getFilename()
    {
        return $this->_filename;
    }
}
