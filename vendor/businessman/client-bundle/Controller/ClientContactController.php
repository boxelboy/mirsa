<?php
namespace BusinessMan\Bundle\ClientBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use BusinessMan\Bundle\ClientBundle\Entity\ClientContact;

/**
 * ClientContactController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/ClientBundle
 */
class ClientContactController extends Controller
{
    /**
     * List all contacts
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400, vary={"Cookie"})
     * @Security("has_role('ROLE_STAFF')")
     */
    public function listAction()
    {
        return $this->render('BusinessManClientBundle:ClientContact:list.html.twig');
    }

    /**
     * View a contact's details
     *
     * @param ClientContact $contact
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=60, maxage=60, lastModified="contact.getLastModified()", vary={"Cookie"})
     * @Security("has_role('ROLE_STAFF')")
     */
    public function viewAction(ClientContact $contact)
    {
        $this->get('session')->save();

        return $this->render('BusinessManClientBundle:ClientContact:view.html.twig', array('contact' => $contact));
    }
}
