<?php
namespace BusinessMan\Bundle\PurchaseOrderBundle\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Computech\Bundle\CommonBundle\Event\RenderExtendableBlockEvent;

/**
 * ExtendableBlockSubscriber
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/PurchaseOrderBundle
 */
class ExtendableBlockSubscriber implements EventSubscriberInterface
{
    /**
     * {@inheritDoc}
     */
    public static function getSubscribedEvents()
    {
        return array(
            'extendable_block.render.supplier_view' => array('onSupplierView', 0)
        );
    }

    /**
     * List purchase orders belonging to the given supplier
     *
     * @param RenderExtendableBlockEvent $event
     */
    public function onSupplierView(RenderExtendableBlockEvent $event)
    {
        $event->addController('BusinessManPurchaseOrderBundle:Supplier:view');
    }
}
