<?php
namespace Computech\Bundle\CommonBundle\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Removes all extraneous whitespace from any JSON response
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/computech/CommonBundle
 */
class JsonCollapseSubscriber implements EventSubscriberInterface
{
    private $environment;

    public function __construct($environment)
    {
        $this->environment = $environment;
    }

    /**
     * {@inheritDoc}
     */
    public static function getSubscribedEvents()
    {
        return array(
            KernelEvents::RESPONSE => array('onKernelResponse', -1024),
        );
    }

    /**
     * @param FilterResponseEvent $event
     */
    public function onKernelResponse(FilterResponseEvent $event)
    {
        $response = $event->getResponse();

        if ($response->headers->get('Content-Type', 'text/plain') == 'application/json') {
            $response->setContent(
                json_encode(
                    json_decode($response->getContent()),
                    $this->environment == 'dev' ? JSON_PRETTY_PRINT : 0
                )
            );
        }
    }
}
