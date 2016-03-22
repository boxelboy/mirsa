<?php
namespace BusinessMan\Bundle\BusinessManBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\SecurityContextInterface;

/**
 * AuthenticationController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/BusinessManBundle
 */
class AuthenticationController extends Controller
{
    /**
     * @param Request $request
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function loginAction(Request $request)
    {
        $session = $request->getSession();

        if ($request->attributes->has(SecurityContextInterface::AUTHENTICATION_ERROR)) {
            $error = $request->attributes->get(SecurityContextInterface::AUTHENTICATION_ERROR);
        } elseif (!is_null($session && $session->has(SecurityContextInterface::AUTHENTICATION_ERROR))) {
            $error = $session->get(SecurityContextInterface::AUTHENTICATION_ERROR);
            $session->remove(SecurityContextInterface::AUTHENTICATION_ERROR);
        } else {
            $error = '';
        }

        $lastUsername = ($session === null) ? '' : $session->get(SecurityContextInterface::LAST_USERNAME);

        $response = new Response();
        $response->headers->set('X-Login', true);

        return $this->render(
            '@BusinessManBusinessMan/Authentication/login.html.twig',
            array(
                'lastUsername' => $lastUsername,
                'error' => $error,
            ),
            $response
        );
    }
}
