<?php
namespace BusinessMan\Bundle\CallBundle\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use BusinessMan\Bundle\BusinessManBundle\Event\CollectDashboardOptionsEvent;
use Symfony\Component\Security\Core\SecurityContextInterface;

/**
 * DashboardSubscriber
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/TaskBundle
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
            'dashboard.collect' => array(
                array('onCollect', 0)
            )
        );
    }

    /**
     * Announce this bundle's dashboard items
     *
     * @param CollectDashboardOptionsEvent $event
     */
    public function onCollect(CollectDashboardOptionsEvent $event)
    {
        if ($this->security->isGranted('ROLE_STAFF')) {
            $widget = $event->addWidget('BusinessManCallBundle:Dashboard:listCalls', 'Your calls', 'black', 'fa-phone', 4, 4, 16, 16);

            $summary = $event->addSummary('BusinessManCallBundle:Dashboard:countCalls', 'Your calls', 'black', 'fa-phone');
            $summary->setLinkedOption($widget);
            $summary->setRoute('calls_list');
        }
    }
}
