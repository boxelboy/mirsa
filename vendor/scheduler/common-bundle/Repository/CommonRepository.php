<?php
namespace Scheduler\Bundle\CommonBundle\Repository;

use Doctrine\ORM\EntityRepository;

class CommonRepository extends EntityRepository
{
    /**
     * @return \DateTime
     */
    public function getLastModified()
    {
        $lastModified = $this->createQueryBuilder('e')
            ->select('MAX(e.lastModified)')
            ->setMaxResults(1)
            ->getQuery()
            ->getSingleScalarResult();

        return \DateTime::createFromFormat('Y-m-d H:i:s', $lastModified);
    }
}