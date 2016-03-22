<?php
namespace BusinessMan\Bundle\JobBundle\Controller;

use BusinessMan\Bundle\JobBundle\Entity\Timesheet;
use BusinessMan\Bundle\JobBundle\Form\Type\TimesheetType;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use BusinessMan\Bundle\JobBundle\Entity\Job;
use Symfony\Component\HttpFoundation\Request;

/**
 * TimesheetController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/JobBundle
 */
class TimesheetController extends Controller
{
    /**
     * Create a timesheet for a job
     *
     * @param Job $job
     * @param Request $request
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=60, maxage=60, vary={"Cookie"})
     * @Security("has_role('ROLE_STAFF')")
     */
    public function createAction(Job $job, Request $request)
    {
        $timesheet = new Timesheet();

        $timesheet->setCreator($this->getUser()->getStaff());
        $timesheet->setDateFrom(new \DateTime());
        $timesheet->setJob($job);
        $timesheet->setStaff($this->getUser()->getStaff());

        $form = $this->createForm(new TimesheetType(), $timesheet);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($timesheet);
            $em->flush();

            return $this->redirect($this->generateUrl('jobs_view', array('job' => $job->getId())) . '#timesheets');
        }

        return $this->render(
            'BusinessManJobBundle:Timesheet:create.html.twig',
            array('form' => $form->createView(), 'job' => $job)
        );
    }

    /**
     * Remove a timesheet for a job
     *
     * @param Job $job
     * @param Request $request
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Security("has_role('ROLE_STAFF')")
     */
    public function removeAction(Job $job, Timesheet $timesheet)
    {
        if ($timesheet->getJob()->getId() !== $job->getId()) {
            throw $this->createNotFoundException();
        }

        $em = $this->getDoctrine()->getManager();
        $em->remove($timesheet);
        $em->flush();

        return $this->redirect($this->generateUrl('jobs_view', array('job' => $job->getId())) . '#timesheets');
    }

    /**
     * Overview of timesheets for managed staff
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Security("has_role('ROLE_STAFF_MANAGER')")
     */
    public function overviewAction()
    {
        return $this->render('BusinessManJobBundle:Timesheet:overview.html.twig');
    }
}
