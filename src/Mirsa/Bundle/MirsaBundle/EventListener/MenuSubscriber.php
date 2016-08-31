<?php
namespace Mirsa\Bundle\MirsaBundle\EventListener;

use Computech\Bundle\CommonBundle\Event\BuildMenuEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Security\Core\SecurityContextInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

/**
 * MenuSubscriber
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/ClientBundle
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
        $main = $event
            ->getMenu()
            ->removeChild('Dashboard')
            ->removeChild('Stock')
            ->removeChild('Projects')
            ->removeChild('Email')
            ->removeChild('Scheduler')
            ->removeChild('Calls')
            ->removeChild('Support')
            ->removeChild('Jobs')
            ->removeChild('Purchase orders')
            ->removeChild('Suppliers')
            ->removeChild('Contacts')
            ->removeChild('Clients');

        if ($this->security->isGranted(array('ROLE_CLIENT_CONTACT'))) {
            $main->addChild('Orders', array('route' => 'mirsa_sales_order_list'))->setAttribute('icon', 'fa-pencil-square-o');
            $main->addChild('Appointments', array('route' => 'mirsa_appointments_list'))->setAttribute('icon', 'fa-calendar');
        }

        if ($this->security->isGranted(array('ROLE_CLIENT_CONTACT_INVENTORY'))) {
            $menu->removeChild('Orders');
            $menu->removeChild('Appointments');
        }
        
        if ($this->security->isGranted(array('ROLE_STAFF'))) {
            $main->addChild('Clients', array('route' => 'mirsa_clients_list'))->setAttribute('icon', 'fa-group');
            $main->addChild('Orders', array('route' => 'mirsa_sales_order_list'))->setAttribute('icon', 'fa-pencil-square-o');
            $main->addChild('Appointments', array('route' => 'mirsa_appointments_list'))->setAttribute('icon', 'fa-calendar');
        }

        /* Standard menu items for all users */
        $main->addChild('Work Orders', array('route' => 'mirsa_work_order_list'))->setAttribute('icon', 'fa-cogs');
        $main->addChild('Assembly Activity', array('route' => 'mirsa_activity_assembly_list'))->setAttribute('icon', 'fa-cogs');
        $main->addChild('Inspection Activity', array('route' => 'mirsa_activity_inspection_list'))->setAttribute('icon', 'fa-cogs');
        $main->addChild('Defect Cross Tab', array('route' => 'mirsa_work_order_defect_cross_tab_report_by_template'))->setAttribute('icon', 'fa-cogs');
        $main->addChild('Batch', array('route' => 'mirsa_stock_quantity_list'))->setAttribute('icon', 'fa-cubes');
        $main->addChild('Inventory', array('route' => 'mirsa_stock_list'))->setAttribute('icon', 'fa-cubes');
        $main->addChild('Order Line Items', array('route' => 'mirsa_sales_order_line_item_list'))->setAttribute('icon', 'fa-list-alt');
    }
}
