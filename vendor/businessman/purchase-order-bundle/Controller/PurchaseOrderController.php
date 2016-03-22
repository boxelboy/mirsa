<?php
namespace BusinessMan\Bundle\PurchaseOrderBundle\Controller;

use BusinessMan\Bundle\PurchaseOrderBundle\Entity\PurchaseOrder;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

/**
 * PurchaseOrderController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/PurchaseOrderBundle
 */
class PurchaseOrderController extends Controller
{
    /**
     * List all purchase orders
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400)
     * @Security("has_role('ROLE_STAFF') or has_role('ROLE_SUPPLIER')")
     */
    public function listAction()
    {
        return $this->render('@BusinessManPurchaseOrder/PurchaseOrder/list.html.twig');
    }

    /**
     * View a purchase order's details
     *
     * @param PurchaseOrder $order
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=60, lastModified="order.getLastModified()")
     * @Security("has_role('ROLE_STAFF') or has_role('ROLE_SUPPLIER')")
     */
    public function viewAction(PurchaseOrder $order)
    {
        if ($this->getUser()->getSupplier()) {
            if ($order->getSupplier() !== $this->getUser()->getSupplier()) {
                throw $this->createNotFoundException();
            }
        }

        return $this->render('@BusinessManPurchaseOrder/PurchaseOrder/view.html.twig', array('order' => $order));
    }
}
