<?php
namespace Mirsa\Bundle\MirsaBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Mirsa\Bundle\MirsaBundle\Entity\PickNote;
use Mirsa\Bundle\MirsaBundle\Entity\SalesOrder;

/**
 * PickNoteController
 *
 * @author Dave Hatch
 * @link   
 */
class PickNoteController extends Controller
{
    
    protected $salesOrder;
    
    /**
     * List all Pick Notes records for the selected SalesOrder
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400, vary={"Cookie"})
     */
    public function pickNotesForSalesOrderAction(SalesOrder $salesOrder)
    {
        return $this->render('MirsaMirsaBundle:PickNote:list.html.twig', array('salesOrder' => $salesOrder));
    }
    
    /**
     * Only fetch pick notes associated with the selected sales order
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
     * View a Pick Note PDF
     *
     * @param PickNote $deliveryNote
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function downloadAction(PickNote $pickNote)
    {
        $containerUrl = $pickNote->getPdf()->getUrl();
        
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