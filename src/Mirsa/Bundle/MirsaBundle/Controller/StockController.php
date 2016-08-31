<?php
namespace Mirsa\Bundle\MirsaBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Mirsa\Bundle\MirsaBundle\Entity\Stock;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * StockController
 *
 * @author Dave Hatch
 * @link   
 */
class StockController extends Controller
{
    /**
     * List all stock
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400, vary={"Cookie"})
     */
    public function listAction()
    {
        return $this->render('MirsaMirsaBundle:Stock:list.html.twig');
    }
    
    /* Used to export the Stock records, this will also work with the filters */
    public function exportAction(Request $request)
    {
        $categoryDescription = $request->query->get('categoryDescription');
        $sku = $request->query->get('sku');
        $description = $request->query->get('description');

        $response = new StreamedResponse();
        $response->setCallback(function() use (&$categoryDescription, &$sku, &$description) {
            $fc = fopen('php://output', 'w+');
            fputcsv($fc, array('Category', 'Sku', 'Description', 'Actual Stock', 'Reserved Stock', 'Unavailable', 'Available', 'Allocated', 'Total Goods In', 'Total WIP', 'Finished Goods', 'Min','In Transit','On Order','Min Order Qty','Min Order Required'),',');
                $qb = $this->getDoctrine()->getRepository('MirsaMirsaBundle:Stock');
                $qb = $qb->createQueryBuilder('s');
                $qb = $qb->select('s.categoryDescription,s.sku,s.description,s.actualStock,s.reservedStock,s.bayUnavailableQty,s.availableStock,s.allocatedStock,s.totalGoodsIn,s.totalWIP,s.totalFinishedGoods,s.minStock,s.totalInTransit,s.onOrderStock,s.minOrderQuantityStock,s.minOrderRequiredStock');
                if ($categoryDescription != "" ) {
                    $qb = $qb->andWhere('LOWER(s.categoryDescription) LIKE :categorydescription');
                    $qb = $qb->setParameter('categorydescription', '%' . strtolower($categoryDescription) . '%');
                }                        
                if ($sku != "" ) {
                    $qb = $qb->andWhere('LOWER(s.sku) LIKE :sku');
                    $qb = $qb->setParameter('sku', '%' . strtolower($sku) . '%');
                }
                if ($description != "" ) {
                    $qb = $qb->andWhere('LOWER(s.description) LIKE :description');
                    $qb = $qb->setParameter('description', '%' . strtolower($description) . '%');
                }

                /* Only export the items  for the currently logged in client*/
                if (!is_null($this->getUser()->getContact())) { 
                    if ($this->getUser()->getContact()->getClient()) {
                        $qb = $qb->andWhere('s.client = :client');
                        $qb = $qb->setParameter('client', $this->getUser()->getContact()->getClient());
                    }
                }
                $qb = $qb->getQuery();
                $stock = $qb->getResult();

            foreach ($stock as $item) {
                fputcsv($fc, array(
                    $item['categoryDescription'],
                    $item['sku'],
                    $item['description'],
                    $item['actualStock'],
                    $item['reservedStock'],
                    $item['bayUnavailableQty'],
                    $item['availableStock'],
                    $item['allocatedStock'],
                    $item['totalGoodsIn'],
                    $item['totalWIP'],
                    $item['totalFinishedGoods'],
                    $item['minStock'],
                    $item['totalInTransit'],
                    $item['onOrderStock'],
                    $item['minOrderQuantityStock'],
                    $item['minOrderRequiredStock']),
                ',');
            }
            fclose($fc);
        });

        $filename = "inventory_export_".date("m_d_Y_His").".csv";
        $response->setStatusCode(200);
        $response->headers->set('Content-Type', 'text/csv; charset=utf-8');
        $response->headers->set('Content-Disposition','attachment; filename=' . $filename);
        return $response;
    }
}