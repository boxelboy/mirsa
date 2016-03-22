<?php

namespace BusinessMan\Bundle\SchedulerBundle\Controller;

use Scheduler\Bundle\CommonBundle\Entity\Resource;
use Scheduler\Bundle\CommonBundle\Entity\Schedule;
use Scheduler\Bundle\CommonBundle\Entity\ScheduleDetail;
use BusinessMan\Bundle\SchedulerBundle\Form\AddResourceType;
use BusinessMan\Bundle\SchedulerBundle\Form\EditResourceType;
use BusinessMan\Bundle\SchedulerBundle\Form\ScheduleDetailType;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Form\FormError;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

/**
 * ScheduleController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/SchedulerBundle
 */
class ScheduleController extends Controller
{
    /**
     * @Security("has_role('ROLE_STAFF')"))
     *
     * @return Response
     */
    public function schedulerAction()
    {
        $groups = $this->getDoctrine()->getRepository('SchedulerCommonBundle:ResourceGroup')
            ->createQueryBuilder('g')
            ->innerJoin('g.memberships', 'm')
            ->innerJoin('m.resource', 'r')
            ->orderBy('g.name', 'ASC')
            ->getQuery()
            ->execute();

        $categories = $this->getDoctrine()->getRepository('SchedulerCommonBundle:ResourceCategory')
            ->createQueryBuilder('c')
            ->innerJoin('c.resources', 'r')
            ->orderBy('c.name', 'ASC')
            ->getQuery()
            ->execute();

        $resources = $this->getDoctrine()->getRepository('SchedulerCommonBundle:Resource')
            ->createQueryBuilder('r')
            ->leftJoin('r.memberships', 'm')
            ->addSelect('m')
            ->orderBy('r.name', 'ASC')
            ->getQuery()
            ->execute();

        $events = $this->getDoctrine()->getRepository('SchedulerCommonBundle:ScheduleEvent')
            ->createQueryBuilder('e')
            ->orderBy('e.type', 'ASC')
            ->getQuery()
            ->execute();

        return $this->render(
            '@BusinessManScheduler/Schedule/scheduler.html.twig',
            array('groups' => $groups, 'categories' => $categories, 'resources' => $resources, 'events' => $events)
        );
    }

    /**
     * View/edit a schedule
     *
     * @param Request $request
     * @param int     $scheduleId
     *
     * @return Response
     *
     * @throws \Symfony\Component\HttpKernel\Exception\NotFoundHttpException
     *
     * @Security("has_role('ROLE_STAFF')"))
     */
    public function editAction(Request $request, $scheduleId)
    {
        $scheduleDetails = $this->getDoctrine()->getRepository('SchedulerCommonBundle:ScheduleDetail')->find((int) $scheduleId);

        if (!$scheduleDetails) {
            $schedule = $this->getDoctrine()->getRepository('SchedulerCommonBundle:Schedule')->find((int) $scheduleId);

            if ($schedule) {
                $scheduleDetails = $schedule->getScheduleDetails();
            } else {
                throw $this->createNotFoundException();
            }
        }

        $form = $this->createForm(new ScheduleDetailType(), $scheduleDetails);
        $form->handleRequest($request);

        if (!$form['overrideConflicts']->getData()) {
            $clashService = $this->get('scheduler.clash');

            foreach ($scheduleDetails->getSchedules() as $schedule) {
                $clashes = $clashService->getClashingSchedules(
                    $schedule->getResource(),
                    $scheduleDetails->getStart(),
                    $scheduleDetails->getEnd(),
                    $scheduleDetails
                );

                if (count($clashes)) {
                    $error = new FormError(
                        sprintf(
                            'Clashes with %s other schedules for %s',
                            count($clashes),
                            $schedule->getResource()->getName()
                        )
                    );

                    $form->get('endTime')->addError($error);
                    $form->get('startTime')->addError($error);
                    $form->get('endDate')->addError($error);
                    $form->get('startDate')->addError($error);
                }
            }
        }

        if ($form->isValid()) {
            $this->getDoctrine()->getManager()->flush();

            return $this->redirect($this->generateUrl('BusinessManSchedulerBundle_schedule_edit', array('scheduleId' => $scheduleDetails->getId())));
        }

        return $this->render('@BusinessManScheduler/Schedules/view.html.twig', array(
            'scheduleDetails' => $scheduleDetails,
            'form' => $form->createView()
        ));
    }

    /**
     * Delete a schedule
     *
     * @Security("has_role('ROLE_STAFF')"))
     *
     * @param ScheduleDetail $scheduleDetail
     *
     * @return Response
     */
    public function deleteAction(ScheduleDetail $scheduleDetails)
    {
        $em = $this->getDoctrine()->getManager();

        $em->remove($scheduleDetails);
        $em->flush();

        return $this->redirect($this->generateUrl('BusinessManSchedulerBundle_schedules'));
    }

    /**
     * Remove a resource from a schedule
     *
     * @Security("has_role('ROLE_STAFF')"))
     *
     * @param int      $scheduleDetails
     * @param Schedule $schedule
     *
     * @return Response
     *
     * @throws AccessDeniedException
     */
    public function removeResourceAction($scheduleDetails, Schedule $schedule)
    {
        if ($schedule->getScheduleDetails()->getId() != $scheduleDetails) {
            throw new AccessDeniedException();
        }

        $em = $this->getDoctrine()->getManager();
        $em->remove($schedule);
        $em->flush();

        return $this->redirect($this->generateUrl('BusinessManSchedulerBundle_schedule_edit', array('scheduleId' => $scheduleDetails)));
    }

    /**
     * Add a resource to a schedule
     *
     * @Security("has_role('ROLE_STAFF')"))
     *
     * @param ScheduleDetail $scheduleDetails
     *
     * @return Response
     */
    public function addResourceAction(Request $request, ScheduleDetail $scheduleDetails)
    {
        $categories = $this->getDoctrine()->getRepository('SchedulerCommonBundle:ResourceCategory')->findAll();

        $schedule = new Schedule();
        $schedule->setScheduleDetails($scheduleDetails);

        $form = $this->createForm(new AddResourceType(), $schedule);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($schedule);
            $em->flush();

            return $this->redirect($this->generateUrl('BusinessManSchedulerBundle_schedule_edit', array('scheduleId' => $scheduleDetails->getId())));
        }

        return $this->render('@BusinessManScheduler/Schedules/add_resource.html.twig', array(
            'scheduleDetails' => $scheduleDetails,
            'categories' => $categories,
            'form' => $form->createView()
        ));
    }

    /**
     * Edit a resource for a schedule
     *
     * @Security("has_role('ROLE_STAFF')"))
     *
     * @param ScheduleDetail $scheduleDetails
     * @param Schedule       $schedule
     *
     * @return Response
     */
    public function editResourceAction(Request $request, ScheduleDetail $scheduleDetails, Schedule $schedule)
    {
        $form = $this->createForm(new EditResourceType(), $schedule);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($schedule);
            $em->flush();

            return $this->redirect($this->generateUrl('BusinessManSchedulerBundle_schedule_edit', array('scheduleId' => $scheduleDetails->getId())));
        }

        return $this->render('@BusinessManScheduler/Schedules/edit_resource.html.twig', array(
            'scheduleDetails' => $scheduleDetails,
            'schedule' => $schedule,
            'form' => $form->createView()
        ));
    }
}
