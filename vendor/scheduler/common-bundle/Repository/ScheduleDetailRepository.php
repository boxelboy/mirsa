<?php
namespace Scheduler\Bundle\CommonBundle\Repository;

class ScheduleDetailRepository extends CommonRepository
{
    /**
     * @return array
     */
    public function getSchedules($filterType, $filterId, \DateTime $from, \DateTime $to)
    {
        $qb = $this->createQueryBuilder('sd')
            ->join('sd.schedules', 's')
            ->join('s.event', 'e')
            ->addSelect('s')
            ->addSelect('e')
            ->addOrderBy('sd.startDate', 'ASC')
            ->addOrderBy('sd.startTime', 'ASC');

        $qb->where($qb->expr()->between('sd.startDate', ':startDate', ':endDate'));
        $qb->andWhere('sd.scheduled = :scheduled');

        switch ($filterType) {
            case 'category':
                $qb->join('s.resource', 'r');
                $qb->andWhere('r.category = :categoryId');
                $qb->setParameter('categoryId', (int) $filterId);

                break;

            case 'resource':
                if ($filterId !== 'all') {
                    $qb->andWhere('s.resource = :resourceId');
                    $qb->setParameter('resourceId', (int) $filterId);
                }

                break;

            case 'group':
                $qb->join('s.resource', 'r');
                $qb->join('r.memberships', 'm');
                $qb->join('m.group', 'g');
                $qb->andWhere('g.id = :groupId');
                $qb->setParameter('groupId', (int) $filterId);

                break;
        }

        $qb->setParameter('startDate', $from, 'date');
        $qb->setParameter('endDate', $to, 'date');
        $qb->setParameter('scheduled', true);

        return $qb->getQuery()->execute();
    }
}
