<?php
namespace BusinessMan\Bundle\QuoteBundle\EventListener;

use Computech\Bundle\CommonBundle\Event\BuildMenuEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Security\Core\SecurityContextInterface;

/**
 * MenuSubscriber
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/QuoteBundle
 */
class MenuSubscriber implements EventSubscriberInterface
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
            'menu.build.app' => array('onBuildMainMenu', 0)
        );
    }

    /**
     * Add items to main menu
     *
     * @param BuildMenuEvent $event
     */
    public function onBuildMainMenu(BuildMenuEvent $event)
    {
        $menu = $event->getMenu();

        if ($this->security->isGranted('ROLE_STAFF')) {
            // TODO: Complete quote view, re-enable menu, re-enable dashboard button
            //$menu->addChild('Quotes', array('route' => 'quotes_list'))->setAttribute('icon', 'fa-file-zip-o');
        }
    }
}
