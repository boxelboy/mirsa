<?php
namespace Synergize\Bundle\DbalBundle\Driver;

use Doctrine\ORM\EntityManager;
use Doctrine\ORM\Id\AbstractIdGenerator;
use Doctrine\ORM\Query\ResultSetMapping;

class IdentityGenerator extends AbstractIdGenerator
{
    /**
     * @var string
     */
    private $sequenceName;

    /**
     * {@inheritDoc}
     */
    public function __construct($sequenceName = null)
    {
        $this->sequenceName = $sequenceName;
    }

    /**
     * {@inheritdoc}
     */
    public function generate(EntityManager $em, $entity)
    {
        $classMetadata = $em->getClassMetadata(get_class($entity));
        $alias = 'LastInsertId';

        $sql = sprintf(
            'SELECT %s AS %s FROM %s ORDER BY ROWID DESC FETCH FIRST ROW ONLY',
            $em->getConnection()->quoteIdentifier($classMetadata->getSingleIdentifierColumnName()),
            $alias,
            $em->getConnection()->quoteIdentifier($classMetadata->getTableName())
        );

        $rsm = new ResultSetMapping();
        $rsm->addScalarResult($alias, $alias);

        $query = $em->createNativeQuery($sql, $rsm);

        return $query->getSingleScalarResult();
    }

    /**
     * {@inheritdoc}
     */
    public function isPostInsertGenerator()
    {
        return true;
    }
}
