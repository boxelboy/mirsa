<?php
namespace Computech\Bundle\CommonBundle\Security\Firewall;

use Computech\Bundle\CommonBundle\Security\Authentication\Token\FileMakerBridgeToken;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\Security\Core\Authentication\AuthenticationManagerInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\SecurityContextInterface;
use Symfony\Component\Security\Http\Firewall\ListenerInterface;
use Symfony\Component\Security\Http\Session\SessionAuthenticationStrategyInterface;

/**
 * Attempt to authenticate requests containing a valid FileMaker bridge token
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/computech/CommonBundle
 */
class BridgeTokenListener implements ListenerInterface
{
    /**
     * @var \Symfony\Component\Security\Core\SecurityContextInterface
     */
    private $securityContext;

    /**
     * @var \Symfony\Component\Security\Core\Authentication\AuthenticationManagerInterface
     */
    private $authenticationManager;

    /**
     * @var \Symfony\Component\Security\Http\Session\SessionAuthenticationStrategyInterface
     */
    private $sessionStrategy;

    /**
     * @param SecurityContextInterface               $securityContext
     * @param AuthenticationManagerInterface         $authenticationManager
     * @param SessionAuthenticationStrategyInterface $sessionStrategy
     */
    public function __construct(
        SecurityContextInterface $securityContext,
        AuthenticationManagerInterface $authenticationManager,
        SessionAuthenticationStrategyInterface $sessionStrategy
    ) {
        $this->securityContext = $securityContext;
        $this->authenticationManager = $authenticationManager;
        $this->sessionStrategy = $sessionStrategy;
    }

    /**
     * Check requests for a valid FileMaker token and attempt authentication
     *
     * @param GetResponseEvent $event
     */
    public function handle(GetResponseEvent $event)
    {
        // Attempt authentication
        $request = $event->getRequest();

        // Check request for token
        $tokenString = null;
        $clearToken = true;
        $isFileMaker = false;

        if ($request->query->has('x-authentication-token')) {
            $tokenString = $request->query->get('x-authentication-token');
            $clearToken = $request->query->get('x-clear-token', 'true') == 'true';
            $isFileMaker = $request->query->get('x-filemaker-environment', 'false') == 'true';
        }

        if ($request->headers->has('X-Authentication-Token')) {
            $tokenString = $request->headers->get('X-Authentication-Token');
            $clearToken = $request->headers->get('X-Clear-Token', 'true') == 'true';
        }

        // Parse token
        if ($tokenString) {
            $token = new FileMakerBridgeToken();
            $token->setToken($tokenString);
            $token->setClear($clearToken);

            try {
                $authToken = $this->authenticationManager->authenticate($token);

                $this->securityContext->setToken($authToken);
                $this->sessionStrategy->onAuthentication($request, $authToken);
                $request->getSession()->set('_filemaker_environment', $isFileMaker);

                return;
            } catch (AuthenticationException $e) {
                $this->securityContext->setToken(null);
            }
        }

        // Return 403 response code
        $response = new Response();
        $response->setStatusCode(403);

        $event->setResponse($response);
    }
}
