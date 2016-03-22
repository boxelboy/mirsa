<?php
namespace BusinessMan\Bundle\ClientBundle\EventListener;

use BusinessMan\Bundle\BusinessManBundle\Event\CollectDashboardOptionsEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Security\Core\SecurityContextInterface;

/**
 * DashboardSubscriber
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/ClientBundle
 */
class DashboardSubscriber implements EventSubscriberInterface
{
    /**
     * @var \Symfony\Component\Security\Core\SecurityContextInterface
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
     * Announce this bundle's dashboard items
     *
     * @param CollectDashboardOptionsEvent $event
     *
     * @return null
     */
    public function onCollect(CollectDashboardOptionsEvent $event)
    {
        if ($this->security->isGranted('ROLE_STAFF')) {
            $widget = $event->addWidget(
                'BusinessManClientBundle:Dashboard:listOwnClients',
                'Managed clients',
                null,
                'fa-group',
                4,
                4,
                16,
                12
            );

            $summary = $event->addSummary(
                'BusinessManClientBundle:Dashboard:countOwnClients',
                'Managed clients',
                null,
                'fa-group'
            );
            $summary->setLinkedOption($widget);
            $summary->setRoute('clients_list');
        }
    }
}
