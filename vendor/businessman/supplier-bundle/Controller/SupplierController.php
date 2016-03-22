<?php
namespace BusinessMan\Bundle\SupplierBundle\Controller;

use BusinessMan\Bundle\SupplierBundle\Entity\Supplier;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

/**
 * SupplierController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/SupplierBundle
 */
class SupplierController extends Controller
{
    /**
     * List all suppliers
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=1)
     * @Security("has_role('ROLE_STAFF')")
     */
    public function listAction()
    {
        return $this->render('BusinessManSupplierBundle:Supplier:list.html.twig');
    }

    /**
     * View a supplier's details
     *
     * @param Supplier $supplier
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=60, lastModified="supplier.getLastModified()")
     * @Security("has_role('ROLE_STAFF')")
     */
    public function viewAction(Supplier $supplier)
    {
        $contacts = $supplier->getContacts()->toArray();

        usort($contacts, function ($a, $b) {
            return strcmp($a->getDisplayName(), $b->getDisplayName());
        });

        return $this->render(
            '@BusinessManSupplier/Supplier/view.html.twig',
            array('supplier' => $supplier, 'contacts' => $contacts)
        );
    }
}
