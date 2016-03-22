<?php
namespace BusinessMan\Bundle\CallBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

/**
 * DashboardType
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/CallBundle
 */
class DashboardController extends Controller
{
    /**
     * Count the open calls belonging to the logged in user
     *
     * @return Response
     *
     * @Cache(public=false, maxage=30, vary={"Cookie"})
     * @Security("has_role('ROLE_STAFF')")
     */
    public function countCallsAction()
    {
        $this->get('session')->save();

        $count = $this->getDoctrine()->getRepository('BusinessManCallBundle:Call')->createQueryBuilder('c')
            ->select('COUNT(c.id)')
            ->andWhere('c.allocatedTo = :staff')
            ->andWhere('c.completed = :completed')
            ->andWhere('c.contactDate <= :contactDate')
            ->setParameter('staff', $this->getUser()->getStaff())
            ->setParameter('completed', false, 'yesno')
            ->setParameter('contactDate', new \DateTime('+7 days'), 'date')
            ->getQuery()
            ->getSingleScalarResult();

        return new Response($count);
    }

    /**
     * List the open calls belonging to the logged in user
     *
     * @param boolean $bridge
     *
     * @return Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400)
     * @Security("has_role('ROLE_STAFF')")
     */
    public function listCallsAction($bridge = false)
    {
        $this->get('session')->save();

        $contactDate = new \DateTime('+7 days');

        return $this->render(
            '@BusinessManCall/List/datatable.html.twig',
            array(
                'header' => false,
                'footer' => false,
                'bridge' => $bridge,
                'url' => $this->generateUrl(
                    'api_calls_list',
                    array('filter' => array(
                        'completed' => false,
                        'contactDate' => $contactDate->format('Y-m-d'),
                        'allocatedTo' => $this->getUser()->getStaff()->getId()
                    ))
                )
            )
        );
    }
}
