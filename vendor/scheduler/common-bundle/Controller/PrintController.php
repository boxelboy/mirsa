<?php
namespace Scheduler\Bundle\CommonBundle\Controller;

use Doctrine\Common\Collections\ArrayCollection;
use Scheduler\Bundle\CommonBundle\Entity\Schedule;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * PrintController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/scheduler/CommonBundle
 */
class PrintController extends Controller
{
    /**
     * Render a read-only printable view
     *
     * @Security("has_role('ROLE_USER')")
     *
     * @return Response
     */
    public function resourceAction(\DateTime $date, $filterType, $filterId, Request $request)
    {
        if ($this->container->has('profiler')) {
            $this->container->get('profiler')->disable();
        }

        $scheduleDetails = $this->getDoctrine()
            ->getRepository('SchedulerCommonBundle:ScheduleDetail')
            ->getSchedules($filterType, $filterId, $date, $date);

        $schedules = array();

        foreach ($scheduleDetails as $scheduleDetail) {
            foreach ($scheduleDetail->getSchedules() as $schedule) {
                $schedules[] = $schedule;
            }
        }

        $resources = array();
        $scheduleOffsets = array();

        foreach ($schedules as $schedule) {
            if (!in_array($schedule->getResource(), $resources)) {
                $resources[] = $schedule->getResource();
            }
        }

        usort($resources, function ($a, $b) {
            return strcmp($a->getName(), $b->getName());
        });

        $resources = array_chunk($resources, 8);

        foreach ($schedules as $schedule) {
            $this->arrangeClashes($schedule, $schedules, $scheduleOffsets);
        }

        return $this->render('@SchedulerCommon/Print/resource.html.twig', array(
            'schedules' => $schedules,
            'resourceGroups' => $resources,
            'scheduleOffsets' => $scheduleOffsets,
            'date' => $date
        ));
    }

    /**
     * Prepare schedule list for display by counting clashes
     *
     * @param Schedule $schedule
     * @param array    $schedules
     * @param array    $scheduleOffsets
     * @param int      $clashes
     *
     * @return int
     */
    private function arrangeClashes(Schedule $schedule, array &$schedules, array &$scheduleOffsets, $clashes = 0)
    {
        $offset = $clashes;
        $hasClashes = false;

        if ($schedule->getScheduleDetails()->isAllDay() || isset($scheduleOffsets[$schedule->getId()])) {
            return;
        }

        $scheduleOffsets[$schedule->getId()] = array();

        foreach ($schedules as $clashingSchedule) {
            if ($schedule->getId() != $clashingSchedule->getId() &&
                !isset($scheduleOffsets[$clashingSchedule->getId()]) &&
                $schedule->getResource() == $clashingSchedule->getResource() &&
                !$clashingSchedule->getScheduleDetails()->isAllDay() &&
                $clashingSchedule->getScheduleDetails()->getStart() < $schedule->getScheduleDetails()->getEnd() &&
                $clashingSchedule->getScheduleDetails()->getEnd() > $schedule->getScheduleDetails()->getStart()
            ) {
                if (!$hasClashes) {
                    $clashes++;
                    $hasClashes = true;
                }

                $clashes = $this->arrangeClashes($clashingSchedule, $schedules, $scheduleOffsets, $clashes);
            }
        }

        $scheduleOffsets[$schedule->getId()] = array(
            'offset' => $offset,
            'clashes' => $clashes
        );

        return $clashes;
    }
}
