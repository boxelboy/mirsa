<?php
namespace BusinessMan\Bundle\PurchaseOrderBundle\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use BusinessMan\Bundle\BusinessManBundle\Event\CollectDashboardOptionsEvent;
use Symfony\Component\Security\Core\SecurityContextInterface;

/**
 * DashboardSubscriber
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/PurchaseOrderBundle
 */
class DashboardSubscriber implements EventSubscriberInterface
{
    /**
     * @var SecurityContextInterface
     */
    private $security;

    /**
     * @param SecurityContextInterface $security
     */
    public function __construct(SecurityContextInterface $security)
    {
        $this->security = $security;
    }

    /**
     * {@inheritDoc}
     */
    public static function getSubscribedEvents()
    {
        return array(
            'dashboard.collect' => array('onCollect', 0)
        );
    }

    /**
     * Add this bundle's dashboard items
     *
     * @param CollectDashboardOptionsEvent $event
     */
    public function onCollect(CollectDashboardOptionsEvent $event)
    {
        if ($this->security->isGranted('ROLE_STAFF')) {
            $widget = $event->addWidget(
                'BusinessManPurchaseOrderBundle:Dashboard:listAwaitingDelivery',
                'Orders awaiting delivery',
                'red',
                'fa-truck',
                4,
                4,
                16,
                12
            );

            $summary = $event->addSummary(
                'BusinessManPurchaseOrderBundle:Dashboard:countAwaitingDelivery',
                'Orders awaiting delivery',
                'red',
                'fa-truck'
            );
            $summary->setLinkedOption($widget);
            $summary->setRoute('purchase_orders_list');
        }
    }
}
