<?php
namespace Mirsa\Bundle\MirsaBundle\Controller;

use Mirsa\Bundle\MirsaBundle\Entity\Client;
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
     */
    public function listAction()
    {
        return $this->render('MirsaMirsaBundle:Client:list.html.twig');
    }

    /**
     * View a client's details
     *
     * @param Client $client
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=60, maxage=60, lastModified="client.getLastModified()", vary={"Cookie"})
     */
    public function viewAction(Client $client)
    {

        $contacts = $client->getContacts()->toArray();

        usort($contacts, function ($a, $b) {
            return strcmp($a->getDisplayName(), $b->getDisplayName());
        });

        return $this->render(
            'MirsaMirsaBundle:Client:view.html.twig',
            array('client' => $client, 'contacts' => $contacts)
        );
    }
}
