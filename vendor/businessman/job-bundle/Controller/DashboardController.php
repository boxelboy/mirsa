<?php
namespace BusinessMan\Bundle\JobBundle\Controller;

use BusinessMan\Bundle\JobBundle\Entity\Timesheet;
use BusinessMan\Bundle\JobBundle\Form\Type\QuickTimesheetType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

/**
 * DashboardController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/JobBundle
 */
class DashboardController extends Controller
{
    /**
     * Count the jobs to which the logged in user is assigned
     *
     * @return Response
     *
     * @Cache(public=false, maxage=30, vary={"Cookie"})
     * @Security("has_role('ROLE_STAFF')")
     */
    public function countOwnJobsAction()
    {
        $this->get('session')->save();

        $count = $this->getDoctrine()->getRepository('BusinessManJobBundle:Job')->createQueryBuilder('j')
            ->select('COUNT(j.id)')
            ->innerJoin('j.assignments', 'a')
            ->andWhere('a.resource = :resource')
            ->andWhere('j.status IN (:status)')
            ->setParameter('resource', $this->getUser()->getStaff()->getResource())
            ->setParameter('status', array('Open', 'Active'))
            ->getQuery()
            ->getSingleScalarResult();

        return new Response($count);
    }

    /**
     * List the jobs to which the logged in user is assigned
     *
     * @param boolean $bridge
     *
     * @return Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400)
     * @Security("has_role('ROLE_STAFF')")
     */
    public function listOwnJobsAction($bridge = false)
    {
        $this->get('session')->save();

        return $this->render(
            '@BusinessManJob/Job/datatable.html.twig',
            array(
                'header' => false,
                'footer' => false,
                'bridge' => $bridge,
                'status' => false,
                'url' => $this->generateUrl(
                    'api_jobs_list',
                    array('filter' => array('own' => true, 'open' => true))
                )
            )
        );
    }

    /**
     * Quickly create a timesheet
     *
     * @param Request $request
     *
     * @return Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400)
     * @Security("has_role('ROLE_STAFF')")
     */
    public function createTimesheetAction(Request $request)
    {
        $timesheet = new Timesheet();
        $timesheet->setStaff($this->getUser()->getStaff());
        $timesheet->setCreator($this->getUser()->getStaff());
        $timesheet->setDateFrom(new \DateTime());

        $form = $this->createForm(new QuickTimesheetType(), $timesheet);
        $form->handleRequest($request);

        if ($request->getMethod() == 'POST') {
            if ($form->isValid()) {
                if (!$timesheet->getTimeValue()) {
                    $duration = $timesheet->getTimeTo()->getTimestamp() - $timesheet->getTimeFrom()->getTimestamp();

                    $timesheet->setTimeValue($duration / 3600);
                }

                if ($timesheet->getJob()) {
                    $isResource = false;

                    foreach ($timesheet->getJob()->getAssignments() as $assignment) {
                        if ($assignment->getResource()->getId() == $this->getUser()->getStaff()->getResource()->getId()) {
                            $isResource = true;
                        }
                    }
                } else {
                    $isResource = true;
                }

                if (!$isResource) {
                    $this->get('session')->getFlashBag()->add(
                        'quick_timesheet_error',
                        'You are not a resource on this job'
                    );
                } else {
                    $em = $this->getDoctrine()->getManager();
                    $em->persist($timesheet);
                    $em->flush();

                    $this->get('session')->getFlashBag()->add('quick_timesheet_success', 'Timesheet has been created');#
                }
            } else {
                $this->get('session')->getFlashBag()->add('quick_timesheet_error', 'Invalid timesheet submitted');
            }

            return $this->redirect(
                $this->generateUrl(
                    $request->isXmlHttpRequest() ? 'jobs_timesheets_create_quick' : 'businessman_dashboard'
                )
            );
        }

        return $this->render(
            '@BusinessManJob/Timesheet/create_dashboard.html.twig',
            array('form' => $form->createView())
        );
    }

    /**
     * Count the timesheets entered by the logged in user this month
     *
     * @return Response
     *
     * @Cache(public=false, maxage=30, vary={"Cookie"})
     * @Security("has_role('ROLE_STAFF')")
     */
    public function countMonthlyTimesheetsAction()
    {
        $this->get('session')->save();

        $start = new \DateTime();
        $start->modify('first day of this month');

        $end = new \DateTime();
        $end->modify('last day of this month');

        $count = $this->getDoctrine()->getRepository('BusinessManJobBundle:Timesheet')
            ->createQueryBuilder('t')
            ->select('COUNT(t.id)')
            ->andWhere('t.staff = :staff')
            ->andWhere('t.dateFrom BETWEEN :start AND :end')
            ->setParameter('staff', $this->getUser()->getStaff())
            ->setParameter('start', $start)
            ->setParameter('end', $end)
            ->getQuery()
            ->getSingleScalarResult();

        return new Response($count);
    }
}
