<?php
namespace Scheduler\Bundle\CommonBundle\Controller;

use Scheduler\Bundle\CommonBundle\Entity\Resource;
use Scheduler\Bundle\CommonBundle\Entity\Schedule;
use Scheduler\Bundle\CommonBundle\Entity\ScheduleDetail;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * ScheduleController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/scheduler/CommonBundle
 */
class ScheduleController extends Controller
{
    /**
     * Fetch schedules for the graphical scheduler
     *
     * @Security("has_role('ROLE_USER')"))
     * @Cache(maxage=1, smaxage=1, expires="+1 second", public=true)
     *
     * @param Request $request
     * @param string  $filterType
     * @param string  $filterId
     *
     * @return Response
     *
     * @throws \Symfony\Component\HttpKernel\Exception\NotFoundHttpException
     */
    public function fetchAction(Request $request, $filterType, $filterId)
    {
        // Parse filters
        if ($request->query->has('from')) {
            $startDate = \DateTime::createFromFormat('Y-m-d', $request->query->get('from'));
        } else {
            $startDate = new \DateTime('first day of this month');
        }

        if ($request->query->has('to')) {
            $endDate = \DateTime::createFromFormat('Y-m-d', $request->query->get('to'));
        } else {
            $endDate = new \DateTime('last day of this month');
        }

        // Get the schedules
        $scheduleDetails = $this->getDoctrine()
            ->getRepository('SchedulerCommonBundle:ScheduleDetail')
            ->getSchedules($filterType, $filterId, $startDate, $endDate);

        return new Response(
            $this->renderView(
                '@SchedulerCommon/Schedule/schedules.json.twig',
                array('scheduleDetails' => $scheduleDetails)
            ),
            200,
            array('Content-Type' => 'application/json')
        );
    }

    /**
     * List schedules that clash with the given schedule
     *
     * @Security("has_role('ROLE_USER')"))
     *
     * @param Request  $request
     * @param Resource $resource
     *
     * @return Response
     */
    public function clashCheckAction(Request $request, Resource $resource)
    {
        if ($request->query->has('newStartDate')) {
            $startDate = \DateTime::createFromFormat('Y-m-d H:i:s', $request->query->get('newStartDate'));
        } else {
            throw $this->createNotFoundException();
        }

        if ($request->query->has('newEndDate')) {
            $endDate = \DateTime::createFromFormat('Y-m-d H:i:s', $request->query->get('newEndDate'));
        } else {
            throw $this->createNotFoundException();
        }

        $clashingSchedules = $this->get('scheduler.clash')->getClashingSchedules(
            $resource,
            $startDate,
            $endDate
        );

        return new Response(
            $this->renderView(
                '@SchedulerCommon/Schedule/schedules.json.twig',
                array('scheduleDetails' => $clashingSchedules)
            ), 200, array('Content-Type' => 'application/json')
        );
    }

    /**
     * Persist changes made by the graphical scheduler
     *
     * @Security("has_role('ROLE_USER')"))
     *
     * @param Request $request
     *
     * @return Response
     */
    public function processAction(Request $request)
    {
        $idsToProcess = array_map('floatval', explode(',', $request->request->get('ids')));

        $scheduleDetails = $this->getDoctrine()->getRepository('SchedulerCommonBundle:ScheduleDetail')
            ->createQueryBuilder('sd')
            ->where('sd.id IN (:ids)')
            ->join('sd.schedules', 's')
            ->addSelect('s')
            ->setParameter('ids', $idsToProcess)
            ->getQuery()
            ->execute();

        $actions = array();

        // Perform updates
        foreach ($scheduleDetails as $scheduleDetail) {
            try {
                if (!$request->request->has($scheduleDetail->getId() . '_id') ||
                    $request->request->get($scheduleDetail->getId() . '_id') != $scheduleDetail->getId()
                ) {
                    continue;
                }

                $idsToProcess = array_diff($idsToProcess, array($scheduleDetail->getId()));

                if ($request->request->get($scheduleDetail->getId() . '_!nativeeditor_status') == 'updated') {
                    $this->updateScheduleDetail($request, $scheduleDetail);
                    $scheduleIds = array();

                    foreach ($scheduleDetail->getSchedules() as $schedule) {
                        $scheduleIds[] = $schedule->getId();
                    }

                    $actions[] = array('type' => 'updated', 'sid' => $scheduleDetail->getId(), 'tid' => $scheduleDetail->getId(), 'scheduleIds' => join(',', $scheduleIds));
                } else if ($request->request->get($scheduleDetail->getId() . '_!nativeeditor_status') == 'deleted') {
                    $id = $scheduleDetail->getId();

                    $em = $this->getDoctrine()->getManager();

                    $em->remove($scheduleDetail);
                    $em->flush();

                    $actions[] = array('type' => 'deleted', 'sid' => $id, 'tid' => $id);
                }
            } catch (\Exception $e) {
                $actions[] = array(
                    'type' => 'error',
                    'sid' => $scheduleDetail->getId(),
                    'tid' => $scheduleDetail->getId(),
                    'code' => $e->getCode(),
                    'message' => $e->getMessage()
                );
            }
        }

        // Perform inserts
        foreach ($idsToProcess as $id) {
            try {
                if ($request->request->get($id . '_!nativeeditor_status') == 'inserted') {
                    $scheduleDetail = $this->createScheduleDetail($request, $id);
                    $scheduleIds = array();

                    foreach ($scheduleDetail->getSchedules() as $schedule) {
                        $scheduleIds[] = $schedule->getId();
                    }

                    $actions[] = array('type' => 'inserted', 'sid' => $id, 'tid' => $scheduleDetail->getId(), 'scheduleIds' => join(',', $scheduleIds));
                }
            } catch (\Exception $e) {
                $actions[] = array(
                    'type' => 'error',
                    'sid' => $id,
                    'tid' => $id,
                    'code' => $e->getCode(),
                    'message' => $e->getMessage()
                );
            }
        }

        return new Response(
            $this->renderView(
                '@SchedulerCommon/Schedule/processor.xml.twig',
                array('actions' => $actions)
            ), 200, array('Content-Type' => 'application/xml')
        );
    }

    /**
     * Update an existing schedule from data passed via Scheduler
     *
     * @param Request  $request
     * @param Schedule $schedule
     */
    private function updateScheduleDetail(Request $request, ScheduleDetail $scheduleDetail)
    {
        // Get data from the request
        $startDate = new \DateTime($request->request->get($scheduleDetail->getId() . '_start_date'));
        $endDate = new \DateTime($request->request->get($scheduleDetail->getId() . '_end_date'));
        $allDay = $request->request->get($scheduleDetail->getId() . '_allDay') == 'true';
        $existingScheduleIds = array();
        $serializedSchedules = explode(',', $request->request->get($scheduleDetail->getId() . '_schedules'));
        $em = $this->getDoctrine()->getManager();
        $newSchedules = array();

        foreach ($scheduleDetail->getSchedules() as $schedule) {
            $existingScheduleIds[$schedule->getId()] = $schedule;
        }

        // Update the schedule details
        $scheduleDetail->setStartDate($startDate);
        $scheduleDetail->setStartTime($startDate);
        $scheduleDetail->setEndDate($endDate);
        $scheduleDetail->setEndTime($endDate);
        $scheduleDetail->setAllDay($allDay);

        // Update schedule resources
        foreach ($serializedSchedules as $serializedSchedule) {
            if (!$serializedSchedule) {
                continue;
            }

            list($scheduleId, $resourceId, $eventId) = explode('-', $serializedSchedule);

            if (array_key_exists($scheduleId, $existingScheduleIds)) {
                $schedule = $existingScheduleIds[$scheduleId];

                unset($existingScheduleIds[$scheduleId]);
            } else {
                $schedule = new Schedule();
                $schedule->setScheduleDetails($scheduleDetail);

                $newSchedules[] = $schedule;

                $em->persist($schedule);
            }

            $resource = $this->getDoctrine()
                ->getRepository('SchedulerCommonBundle:Resource')
                ->find($resourceId);

            $event = $this->getDoctrine()
                ->getRepository('SchedulerCommonBundle:ScheduleEvent')
                ->find($eventId);

            $schedule->setResource($resource);

            if ($event) {
                $schedule->setEvent($event);
            }
        }

        // Remove deleted resources
        foreach ($existingScheduleIds as $schedule) {
            $em->remove($schedule);
        }

        // Commit changes
        $em->flush();

        // Fetch new schedule identifiers
        foreach ($newSchedules as $schedule) {
            $scheduleDetail->getSchedules()->add($schedule);
        }
    }

    /**
     * Create a schedule from data passed via Scheduler
     *
     * @param Request $request
     * @param $id
     *
     * @return Schedule
     */
    private function createScheduleDetail(Request $request, $id)
    {
        $scheduleDetail = new ScheduleDetail();

        $startDate = new \DateTime($request->request->get($id . '_start_date'));
        $endDate = new \DateTime($request->request->get($id . '_end_date'));
        $allDay = $request->request->get($id . '_allDay') == 'true';

        $scheduleDetail->setBookedFor($request->request->get($id . '_text'));
        $scheduleDetail->setStartDate($startDate);
        $scheduleDetail->setStartTime($startDate);
        $scheduleDetail->setEndDate($endDate);
        $scheduleDetail->setEndTime($endDate);
        $scheduleDetail->setAllDay($allDay);

        $em = $this->getDoctrine()->getManager();
        $em->persist($scheduleDetail);
        $em->flush();

        $resourceIds = explode(',', $request->request->get($id . '_resources'));

        foreach ($resourceIds as $resourceId) {
            if ($resourceId) {
                $resource = $this->getDoctrine()
                    ->getRepository('SchedulerCommonBundle:Resource')
                    ->find($resourceId);

                $schedule = new Schedule();
                $schedule->setScheduleDetails($scheduleDetail);
                $schedule->setResource($resource);

                $em->persist($schedule);
            }
        }

        $em->flush();

        return $scheduleDetail;
    }
}
