<?php
namespace Synergize\Bundle\DbalBundle\Driver;

use Doctrine\DBAL\Driver as DriverInterface;

class Driver implements DriverInterface
{
    /**
     * {@inheritdoc}
     */
    public function connect(array $params, $username = null, $password = null, array $driverOptions = array())
    {
        return new Connection($params, $username, $password, $driverOptions);
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'synergize';
    }

    /**
     * {@inheritdoc}
     */
    public function getSchemaManager(\Doctrine\DBAL\Connection $connection)
    {
        return new SchemaManager($connection);
    }

    /**
     * {@inheritdoc}
     */
    public function getDatabasePlatform()
    {
        return new Platform();
    }

    /**
     * {@inheritdoc}
     */
    public function getDatabase(\Doctrine\DBAL\Connection $connection)
    {
        return '';
    }
}
