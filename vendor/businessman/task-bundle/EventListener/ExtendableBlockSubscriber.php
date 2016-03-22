<?php
namespace BusinessMan\Bundle\TaskBundle\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Computech\Bundle\CommonBundle\Event\RenderExtendableBlockEvent;

/**
 * ExtendableBlockSubscriber
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/TaskBundle
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
     * List tasks belonging to the given client
     *
     * @param RenderExtendableBlockEvent $event
     */
    public function onClientView(RenderExtendableBlockEvent $event)
    {
        $event->addController('BusinessManTaskBundle:Client:view');
    }
}
