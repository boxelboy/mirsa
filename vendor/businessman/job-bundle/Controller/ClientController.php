<?php
namespace BusinessMan\Bundle\JobBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use BusinessMan\Bundle\ClientBundle\Entity\Client;

/**
 * ClientController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/JobBundle
 */
class ClientController extends Controller
{
    /**
     * List jobs belonging to the given client
     *
     * @param Client $client
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400, vary={"Cookie"})
     * @Security("has_role('ROLE_STAFF')")
     */
    public function viewAction(Client $client)
    {
        return $this->render('BusinessManJobBundle:Client:view.html.twig', array('client' => $client));
    }
}
