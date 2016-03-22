<?php
namespace BusinessMan\Bundle\SupplierBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use BusinessMan\Bundle\SupplierBundle\Entity\SupplierContact;

/**
 * SupplierContactController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/SupplierContactBundle
 */
class SupplierContactController extends Controller
{
    /**
     * List all contacts
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Security("has_role('ROLE_STAFF')")
     * @Cache(public=true, smaxage=1)
     */
    public function listAction()
    {
        return $this->render('BusinessManSupplierBundle:SupplierContact:list.html.twig');
    }

    /**
     * View a contact's details
     *
     * @param SupplierContact $contact
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Security("has_role('ROLE_STAFF')")
     * @Cache(public=true, smaxage=60, lastModified="contact.getLastModified()")
     */
    public function viewAction(SupplierContact $contact)
    {
        return $this->render('BusinessManSupplierBundle:SupplierContact:view.html.twig', array('contact' => $contact));
    }
}
