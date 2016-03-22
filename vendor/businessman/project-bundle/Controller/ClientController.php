<?php
namespace BusinessMan\Bundle\ProjectBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use BusinessMan\Bundle\ClientBundle\Entity\Client;

/**
 * ClientController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/ProjectBundle
 */
class ClientController extends Controller
{
    /**
     * List projects belonging to the given client
     *
     * @param Client $client
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400)
     * @Security("has_role('ROLE_STAFF')")
     */
    public function viewAction(Client $client)
    {
        return $this->render('BusinessManProjectBundle:Client:view.html.twig', array('client' => $client));
    }
}
