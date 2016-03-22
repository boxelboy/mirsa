<?php
namespace BusinessMan\Bundle\ClientBundle\Controller;

use BusinessMan\Bundle\ClientBundle\Entity\Client;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

/**
 * ClientController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/ClientBundle
 */
class ClientController extends Controller
{
    /**
     * List all clients
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400, vary={"Cookie"})
     * @Security("has_role('ROLE_STAFF')")
     */
    public function listAction()
    {
        return $this->render('BusinessManClientBundle:Client:list.html.twig');
    }

    /**
     * View a client's details
     *
     * @param Client $client
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=60, maxage=60, lastModified="client.getLastModified()", vary={"Cookie"})
     * @Security("has_role('ROLE_STAFF')")
     */
    public function viewAction(Client $client)
    {
        $contacts = $client->getContacts()->toArray();

        usort($contacts, function ($a, $b) {
            return strcmp($a->getDisplayName(), $b->getDisplayName());
        });

        return $this->render(
            'BusinessManClientBundle:Client:view.html.twig',
            array('client' => $client, 'contacts' => $contacts)
        );
    }
}
