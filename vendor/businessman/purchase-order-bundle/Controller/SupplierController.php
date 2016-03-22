<?php
namespace BusinessMan\Bundle\PurchaseOrderBundle\Controller;

use BusinessMan\Bundle\SupplierBundle\Entity\Supplier;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

/**
 * SupplierController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/PurchaseOrderBundle
 */
class SupplierController extends Controller
{
    /**
     * List purchase orders belonging to the given supplier
     *
     * @param Supplier $supplier
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400)
     * @Security("has_role('ROLE_STAFF')")
     */
    public function viewAction(Supplier $supplier)
    {
        return $this->render('BusinessManPurchaseOrderBundle:Supplier:view.html.twig', array('supplier' => $supplier));
    }
}
