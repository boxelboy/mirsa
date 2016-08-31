<?php
namespace Mirsa\Bundle\MirsaBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Mirsa\Bundle\MirsaBundle\Entity\WorkOrderSheet;
use Mirsa\Bundle\MirsaBundle\Entity\WorkOrder;

/**
 * WorkOrderSheetController
 *
 * @author cps
 * @link   
 */
class WorkOrderSheetController extends Controller
{
    
    protected $workOrder;
    
    /**
     * List all records for the selected WorkOrder
     *
     * @param WorkOrder $workOrder
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400, vary={"Cookie"})
     */
    public function sheetForWorkOrderAction(WorkOrder $workOrder)
    {
        //return $this->render('MirsaMirsaBundle:WorkOrderSheet:list.html.twig', array('workOrder' => $workOrder));    
        $lineItems = $this->getDoctrine()->getRepository('MirsaMirsaBundle:JobInspectionLineItem')
            ->createQueryBuilder('li')
            ->select('li.dateInspected,li.batchNo,li.serialNo,li.manufacturedDate,li.qtyInspected,li.qtyRejected,li.qtyReworked,li.qtyAccepted,li.description')
            ->where('li.workOrder = :wo')
            ->setParameter('wo', $workOrder->getId())
            ->getQuery()
            ->getResult();

        var_dump($lineItems); die;

        return $this->render(
            'MirsaMirsaBundle:WorkOrderSheet:list.html.twig',
            array('insTotal' => $ia['insTotal'], 'rejTotal' => $ia['rejTotal'])
        );       
    }

    /**
     * Only fetch work order sheet associated with the selected work order
     *
     * @param string $alias
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    protected function getQueryBuilder($alias)
    {
        $qb = parent::getQueryBuilder($alias);
        
        $qb->andWhere($alias . '.workOrder = :workorder');
        $qb->setParameter('workorder',$this->workOrder->getId());

        return $qb;
    }        
    
    

    /**
     * View a Work Order Sheet PDF
     *
     * @param WorkOrder $workOrder
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function downloadAction(WorkOrder $workOrder)
    {
        $containerUrl = $workOrder->getPdf()->getUrl();
        
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