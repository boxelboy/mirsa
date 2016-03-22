<?php
namespace BusinessMan\Bundle\PurchaseOrderBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

/**
 * DashboardController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/PurchaseOrderBundle
 */
class DashboardController extends Controller
{
    /**
     * Count purchase orders that are in the 'Awaiting Delivery' state
     *
     * @return Response
     *
     * @Cache(public=false, maxage=30)
     * @Security("has_role('ROLE_STAFF')")
     */
    public function countAwaitingDeliveryAction()
    {
        $this->get('session')->save();

        $count = $this->getDoctrine()->getRepository('BusinessManPurchaseOrderBundle:PurchaseOrder')->createQueryBuilder('p')
            ->select('COUNT(p.id)')
            ->andWhere('p.progress = :progress')
            ->setParameter('progress', 'Awaiting Delivery')
            ->getQuery()
            ->getSingleScalarResult();

        return new Response($count);
    }

    /**
     * List purchase orders that are in the 'Awaiting Delivery' state
     *
     * @param boolean $bridge
     *
     * @return Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400)
     * @Security("has_role('ROLE_STAFF')")
     */
    public function listAwaitingDeliveryAction($bridge = false)
    {
        $this->get('session')->save();

        return $this->render(
            '@BusinessManPurchaseOrder/PurchaseOrder/datatable.html.twig',
            array(
                'header' => false,
                'footer' => false,
                'dashboard' => true,
                'bridge' => $bridge,
                'url' => $this->generateUrl(
                    'api_purchase_orders_list',
                    array('filter' => array('progress' => 'Awaiting Delivery'))
                )
            )
        );
    }
}
