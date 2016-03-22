<?php
namespace Mirsa\Bundle\MirsaBundle\EventListener;

use Computech\Bundle\CommonBundle\Event\BuildMenuEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Security\Core\SecurityContextInterface;

/**
 * MenuSubscriber
 *
 * @author cps
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


//        if ($this->security->isGranted('ROLE_STAFF')) {
            $main = $event
                ->getMenu()
                ->removeChild('Stock')
                ->removeChild('Projects')
                ->removeChild('Email')
                ->removeChild('Scheduler')
                ->removeChild('Calls')
                ->removeChild('Support');

            $main->addChild('Orders', array('route' => 'mirsa_sales_order_list'))->setAttribute('icon', 'fa-pencil-square-o');
            $main->addChild('Order Line Items', array('route' => 'mirsa_sales_order_line_item_list'))->setAttribute('icon', 'fa-list-alt');
            $main->addChild('Inventory', array('route' => 'mirsa_stock_list'))->setAttribute('icon', 'fa-cubes');
            $main->addChild('Batch', array('route' => 'mirsa_stock_quantity_list'))->setAttribute('icon', 'fa-cubes');
            $main->addChild('Appointments', array('route' => 'mirsa_appointments_list'))->setAttribute('icon', 'fa-calendar');
            $main->addChild('Assembly Activity', array('route' => 'mirsa_activity_assembly_list'))->setAttribute('icon', 'fa-cogs');
            $main->addChild('Inspection Activity', array('route' => 'mirsa_activity_inspection_list'))->setAttribute('icon', 'fa-cogs');
            $main->addChild('Work Orders', array('route' => 'mirsa_work_order_list'))->setAttribute('icon', 'fa-cogs');
            $main->addChild('Tasks', array('route' => 'mirsa_task_list'))->setAttribute('icon', 'fa-tasks');
            
       //$inventoryView = $this->_security->getToken()->getUser()->getInventoryView();
       
     /*  if ($inventoryView == "Yes") {
           $menu->removeChild('menu.clients');
           $menu->removeChild('menu.contacts');
           $menu->removeChild('menu.jobs');
           $menu->removeChild('menu.task');
           $menu->removeChild('Orders');
           $menu->removeChild('Appointments');
       }*/
      

  //      }
    }
}
