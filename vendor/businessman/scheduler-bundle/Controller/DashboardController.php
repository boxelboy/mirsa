<?php
namespace BusinessMan\Bundle\SchedulerBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
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
     * Agenda for the logged in user
     *
     * @return Response
     *
     * @Cache(public=false, maxage=30)
     * @Security("has_role('ROLE_STAFF')")
     */
    public function agendaAction()
    {
        $this->get('session')->save();

        $start = new \DateTime('last sunday');
        $end = new \DateTime('next monday');

        $schedules = $this->getDoctrine()
            ->getRepository('SchedulerCommonBundle:ScheduleDetail')
            ->getSchedules('resource', $this->getUser()->getStaff()->getResource()->getId(), $start, $end);

        return $this->render('@BusinessManScheduler/Dashboard/agenda.html.twig', array('schedules' => $schedules));
    }
}
