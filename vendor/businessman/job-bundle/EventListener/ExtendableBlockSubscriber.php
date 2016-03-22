<?php
namespace BusinessMan\Bundle\JobBundle\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Computech\Bundle\CommonBundle\Event\RenderExtendableBlockEvent;

/**
 * ExtendableBlockSubscriber
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/JobBundle
 */
class ExtendableBlockSubscriber implements EventSubscriberInterface
{
    /**
     * {@inheritDoc}
     */
    public static function getSubscribedEvents()
    {
        return array(
            'extendable_block.render.client_view' => array('onClientView', 0)
        );
    }

    /**
     * List jobs belonging to the given client
     *
     * @param RenderExtendableBlockEvent $event
     */
    public function onClientView(RenderExtendableBlockEvent $event)
    {
        $event->addController('BusinessManJobBundle:Client:view');
    }
}
