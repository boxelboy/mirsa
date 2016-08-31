<?php
namespace Mirsa\Bundle\MirsaBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Mirsa\Bundle\MirsaBundle\Entity\JobInspectionLineItem;
use Mirsa\Bundle\MirsaBundle\Entity\SalesOrder;

/**
 * JobInspectionLineItemController
 *
 * @author cps
 * @link   
 */
class JobInspectionLineItemController extends Controller
{
    
    protected $workOrder;
    
    /**
     * List all Delivery Notes records for the selected SalesOrder
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400, vary={"Cookie"})
     */
    public function listAction(WorkOrder $workOrder)
    {
        return $this->render('MirsaMirsaBundle:JobInspectionLineItem:list.html.twig', array('workOrder' => $workOrder));
    }
    
    /**
     * Only fetch delivery notes associated with the selected sales order
     *
     * @param string $alias
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    protected function getQueryBuilder($alias)
    {
        $qb = parent::getQueryBuilder($alias);
        
        $qb->andWhere($alias . '.salesOrder = :salesorder');
        $qb->setParameter('salesorder',$this->salesOrder->getId());

        return $qb;
    }        

    /**
     * View a Delivery Note PDF
     *
     * @param DeliveryNote $deliveryNote
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function downloadAction(DeliveryNote $deliveryNote)
    {
        $containerUrl = $deliveryNote->getPdf()->getUrl();
        
        $url = sprintf(
            '%s://%s:%s/%s',
            $this->container->getParameter('businessman.protocol'),
            $this->container->getParameter('businessman.host'),
            $this->container->getParameter('businessman.port'),
            $containerUrl
        );

        try {
            return new Response(file_get_contents($url), 200, array('Content-Type' => 'application/pdf'));
        } catch (\Exception $e) {
            throw $this->createNotFoundException();
        }
    }
    

}