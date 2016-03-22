<?php
namespace BusinessMan\Bundle\TaskBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

/**
 * DashboardController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/TaskBundle
 */
class DashboardController extends Controller
{
    /**
     * Count the open tasks belonging to the logged in user
     *
     * @return Response
     *
     * @Cache(public=false, maxage=30)
     * @Security("has_role('ROLE_STAFF')")
     */
    public function countTasksAction()
    {
        $this->get('session')->save();

        $count = $this->getDoctrine()->getRepository('BusinessManTaskBundle:Task')->createQueryBuilder('t')
            ->select('COUNT(t.id)')
            ->andWhere('t.resource = :resource')
            ->andWhere('t.status != :completed')
            ->andWhere('t.dueDate <= :dueDate')
            ->setParameter('resource', $this->getUser()->getStaff()->getResource())
            ->setParameter('completed', 'Completed')
            ->setParameter('dueDate', new \DateTime('+7 days'), 'date')
            ->getQuery()
            ->getSingleScalarResult();

        return new Response($count);
    }

    /**
     * List the open tasks belonging to the logged in user
     *
     * @param boolean $bridge
     *
     * @return Response
     *
     * @Security("has_role('ROLE_STAFF')")
     * @Cache(public=true, smaxage=86400, maxage=86400)
     */
    public function listTasksAction($bridge = false)
    {
        $this->get('session')->save();

        $dueDate = new \DateTime('+7 days');

        return $this->render(
            '@BusinessManTask/List/datatable.html.twig',
            array(
                'header' => false,
                'footer' => false,
                'bridge' => $bridge,
                'url' => $this->generateUrl(
                    'api_tasks_list',
                    array('filter' => array(
                        'complete' => false,
                        'dueDate' => $dueDate->format('Y-m-d'),
                        'resource' => $this->getUser()->getStaff()->getResource()->getId()
                    ))
                )
            )
        );
    }
}
