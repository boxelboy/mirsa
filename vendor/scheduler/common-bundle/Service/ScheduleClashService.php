<?php
namespace Scheduler\Bundle\CommonBundle\Service;

use Scheduler\Bundle\CommonBundle\Entity\Resource;
use Scheduler\Bundle\CommonBundle\Entity\ScheduleDetail;
use Doctrine\Common\Persistence\ManagerRegistry;

/**
 * ScheduleClashService
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/scheduler/CommonBundle
 */
class ScheduleClashService
{
    /**
     * @var ManagerRegistry
     */
    private $_doctrine;

    /**
     * @param ManagerRegistry $doctrine
     */
    public function __construct(ManagerRegistry $doctrine)
    {
        $this->_doctrine = $doctrine;
    }

    /**
     * Get schedules that clash with the given resource and times
     *
     * @param Resource       $resource
     * @param \DateTime      $newStart
     * @param \DateTime      $newEnd
     * @param ScheduleDetail $scheduleDetails
     *
     * @return mixed
     */
    public function getClashingSchedules(
        Resource $resource, \DateTime $newStart, \DateTime $newEnd, ScheduleDetail $scheduleDetails = null
    ) {
        $qb = $this->_doctrine->getRepository('SchedulerCommonBundle:ScheduleDetail')
            ->createQueryBuilder('sd')
            ->join('sd.schedules', 's')
            ->leftJoin('s.event', 'e')
            ->addSelect('s')
            ->addSelect('e')
            ->where('s.resource = :resource')
            ->andWhere('sd.startDate <= :endDate')
            ->andWhere('sd.endDate >= :startDate')
            ->andWhere('sd.startTime < :endTime')
            ->andWhere('sd.endTime > :startTime')
            ->andWhere('sd.scheduled = :scheduled')
            ->setParameter('resource', $resource)
            ->setParameter('startDate', $newStart, 'date')
            ->setParameter('endDate', $newEnd, 'date')
            ->setParameter('startTime', $newStart, 'time')
            ->setParameter('endTime', $newEnd, 'time')
            ->setParameter('scheduled', true);

        if ($scheduleDetails) {
            $qb->andWhere('sd != :scheduleDetail');
            $qb->setParameter('scheduleDetail', $scheduleDetails);
        }

        return $qb->getQuery()->execute();
    }
}
