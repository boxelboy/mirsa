<?php
namespace BusinessMan\Bundle\ClientBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;

/**
 * DashboardController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/ClientBundle
 */
class DashboardController extends Controller
{
    /**
     * Count of the clients managed by the logged in staff member
     *
     * @return Response
     *
     * @Cache(public=false, maxage=30, vary={"Cookie"})
     * @Security("has_role('ROLE_STAFF')")
     */
    public function countOwnClientsAction()
    {
        $this->get('session')->save();

        $count = $this->getDoctrine()->getRepository('BusinessManClientBundle:Client')->createQueryBuilder('c')
            ->select('COUNT(c.id)')
            ->andWhere('c.manager = :manager')
            ->setParameter('manager', $this->getUser()->getStaff())
            ->getQuery()
            ->getSingleScalarResult();

        return new Response($count);
    }

    /**
     * List the clients managed by the logged in staff member
     *
     * @param boolean $bridge
     *
     * @return Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400)
     * @Security("has_role('ROLE_STAFF')")
     */
    public function listOwnClientsAction($bridge = false)
    {
        $this->get('session')->save();

        return $this->render(
            '@BusinessManClient/Client/datatable.html.twig',
            array(
                'header' => false,
                'footer' => false,
                'bridge' => $bridge,
                'url' => $this->generateUrl(
                    'api_clients_list',
                    array('filter' => array('manager' => $this->getUser()->getStaff()->getId()))
                )
            )
        );
    }
}
