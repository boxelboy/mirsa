<?php
namespace BusinessMan\Bundle\CallBundle\Controller;

use BusinessMan\Bundle\CallBundle\Entity\Call;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

/**
 * CallController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/CallBundle
 */
class CallController extends Controller
{
    /**
     * List all calls
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400, vary={"Cookie"})
     * @Security("has_role('ROLE_STAFF')")
     */
    public function listAction()
    {
        return $this->render('BusinessManCallBundle:Call:list.html.twig');
    }

    /**
     * View a call's details
     *
     * @param Call $call
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=60, maxage=60, lastModified="call.getLastModified()", vary={"Cookie"})
     * @Security("has_role('ROLE_STAFF')")
     */
    public function viewAction(Call $call)
    {
        return $this->render(
            'BusinessManCallBundle:Call:view.html.twig',
            array('call' => $call)
        );
    }
}
