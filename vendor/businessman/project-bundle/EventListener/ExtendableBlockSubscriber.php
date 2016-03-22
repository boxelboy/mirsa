<?php
namespace BusinessMan\Bundle\ProjectBundle\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Computech\Bundle\CommonBundle\Event\RenderExtendableBlockEvent;

/**
 * ExtendableBlockSubscriber
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/ProjectBundle
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
     * List projects belonging to a client
     *
     * @param RenderExtendableBlockEvent $event
     */
    public function onClientView(RenderExtendableBlockEvent $event)
    {
        $event->addController('BusinessManProjectBundle:Client:view');
    }
}
